import React, { useRef, useState } from 'react';
import { uploadFile } from '../../utils/storage.ts';
import toast from 'react-hot-toast';
import Button from './Button.tsx';
import Input from './Input.tsx';
import { useAdmin } from '../../hooks/useAdmin.ts';

interface FilePickerProps {
    label: string;
    currentUrl: string;
    onUrlChange: (url: string) => void;
    accept?: string;
    bucket: 'media' | 'overlays';
}

const FilePicker: React.FC<FilePickerProps> = ({ label, currentUrl, onUrlChange, accept="image/*", bucket }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { supabaseClient } = useAdmin();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading(`Uploading ${label}...`);
        try {
            const url = await uploadFile(file, supabaseClient, bucket);
            onUrlChange(url);
            toast.success('File uploaded successfully!', { id: toastId });
        } catch (err: any) {
            toast.error(`Upload failed. Check console.`, { id: toastId });
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <Input 
              id={label.replace(/\s/g, '-')} 
              label={`${label} URL`} 
              value={currentUrl} 
              onChange={(e) => onUrlChange(e.target.value)} 
              placeholder="https://... or upload a file"
            />
            <input type="file" ref={fileInputRef} onChange={handleUpload} style={{ display: 'none' }} accept={accept} />
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="mt-2 text-xs">
                {isUploading ? 'Uploading...' : `Upload ${label}`}
            </Button>
        </div>
    );
};

export default FilePicker;