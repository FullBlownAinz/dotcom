import toast from 'react-hot-toast';
import { SupabaseClient } from '@supabase/supabase-js';

// New function to convert a file to a Base64 Data URL
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export const uploadFile = async (file: File, supabase: SupabaseClient | null, bucket: 'media' | 'overlays'): Promise<string> => {
    // --- LOCAL MODE ---
    // If not connected to Supabase, fallback to local Base64 encoding.
    if (!supabase) {
        try {
            const dataUrl = await fileToDataUrl(file);
            return dataUrl;
        } catch (error) {
            console.error('Error converting file to Data URL:', error);
            toast.error('Could not process file for local storage.');
            throw error;
        }
    }

    // --- SUPABASE MODE ---
    const sanitizeName = (name: string) => name.replace(/[^\w.\-]+/g, '_');
    const path = `uploads/${Date.now()}-${sanitizeName(file.name)}`;
    
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
    });
    
    if (error) {
        console.error('Supabase Storage Error:', error);
        toast.error(`Upload failed: ${error.message}`);
        throw error;
    }
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    
    if (!publicUrl) {
        const urlError = new Error('Could not get public URL for the uploaded file.');
        toast.error(urlError.message);
        throw urlError;
    }
    
    return publicUrl;
};