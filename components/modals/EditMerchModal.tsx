import React, { useState, useEffect, useRef } from 'react';
import { MerchItem, RichTextBlock } from '../../types/index.ts';
import Button from '../ui/Button.tsx';
import Input from '../ui/Input.tsx';
import { X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Portal from '../ui/Portal.tsx';
import QuillEditor from '../ui/QuillEditor.tsx';
import { toSquareDataURL } from '../../src/edit/imageSquare.ts';
import { uploadFile } from '../../utils/storage.ts';
import { useAdmin } from '../../hooks/useAdmin.ts';

interface EditMerchModalProps {
  merch: MerchItem | null;
  onClose: () => void;
  onSave: (updatedMerch: MerchItem) => void;
}

const EditMerchModal: React.FC<EditMerchModalProps> = ({ merch, onClose, onSave }) => {
  const [editedMerch, setEditedMerch] = useState<MerchItem | null>(null);
  const [price, setPrice] = useState('');
  const [richDesc, setRichDesc] = useState<RichTextBlock[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { supabaseClient } = useAdmin();

  useEffect(() => {
    if (merch) {
      setEditedMerch(merch);
      setPrice((merch.price_cents / 100).toFixed(2));
      
      // Attempt to parse description as RichText JSON, otherwise convert text to paragraph
      try {
        const parsed = JSON.parse(merch.description);
        if (Array.isArray(parsed)) {
            setRichDesc(parsed);
        } else {
            throw new Error("Not array");
        }
      } catch (e) {
        setRichDesc(merch.description ? [{ type: 'paragraph', content: merch.description }] : []);
      }
    } else {
      setEditedMerch(null);
      setPrice('');
      setRichDesc([]);
    }
  }, [merch]);

  if (!editedMerch) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;
    
    setEditedMerch(prev => prev ? { ...prev, [name]: isCheckbox ? checked : value } : null);
  };
  
  const handleGenericChange = (update: Partial<MerchItem>) => {
    setEditedMerch(prev => prev ? { ...prev, ...update } : null);
  };

  const getImages = () => editedMerch.image_urls && editedMerch.image_urls.length > 0 ? editedMerch.image_urls : (editedMerch.image_url ? [editedMerch.image_url] : []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentImages = getImages();
    if (currentImages.length >= 4) {
        toast.error("Max 4 images allowed.");
        return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Processing & Uploading Image...');
    try {
        const { blob, name } = await toSquareDataURL(file);
        const fileToUpload = new File([blob], name, { type: 'image/png' });

        const url = await uploadFile(fileToUpload, supabaseClient, 'media');
        
        const newImages = [...currentImages, url];
        handleGenericChange({ 
            image_urls: newImages, 
            image_url: newImages[0] // sync legacy field
        });
        
        toast.success('Image added!', { id: toastId });
    } catch (err: any) {
        toast.error(`Upload failed.`, { id: toastId });
    } finally {
        setIsUploading(false);
        if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const currentImages = getImages();
    const newImages = currentImages.filter((_, i) => i !== index);
    handleGenericChange({
        image_urls: newImages,
        image_url: newImages.length > 0 ? newImages[0] : ''
    });
  };

  const handleSave = () => {
    if (editedMerch) {
        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue < 0) {
            toast.error("Please enter a valid price.");
            return;
        }
        if (!editedMerch.name) {
            toast.error("Name is a required field.");
            return;
        }
        
        const images = getImages();
        if (images.length === 0) {
             toast.error("At least one image is required.");
             return;
        }

        const price_cents = Math.round(priceValue * 100);
        
        // Stringify rich text description to store in 'description' text column
        const description = JSON.stringify(richDesc);
        
        const finalMerch = { 
            ...editedMerch, 
            price_cents, 
            description,
            image_urls: images,
            image_url: images[0] // Ensure legacy field is populated
        };
        
        onSave(finalMerch);
        onClose();
    }
  };

  const images = getImages();

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 animate-fade-in overflow-y-auto"
      >
        <div
          className="bg-[#0A0A0A] border-2 border-gray-800 p-6 w-full max-w-2xl text-fba-white relative mt-16 mb-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-lg uppercase">Edit Merch Item</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
              </button>
          </div>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <Input id="name" name="name" label="Name" value={editedMerch.name} onChange={handleInputChange} />
              
              {/* Image Manager */}
              <div>
                  <label className="font-display text-sm text-gray-400 mb-2 block">Images (Max 4, Auto-Squared)</label>
                  <div className="flex flex-wrap gap-4 mb-2">
                      {images.map((url, idx) => (
                          <div key={idx} className="relative group w-24 h-24 border border-gray-700">
                              <img src={url} alt="Merch thumb" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-0 right-0 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <Trash2 size={12} />
                              </button>
                          </div>
                      ))}
                      {images.length < 4 && (
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-500 transition-colors"
                            disabled={isUploading}
                          >
                             {isUploading ? '...' : '+ Add'}
                          </button>
                      )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
              </div>

              <Input id="price" name="price" label={`Price (${editedMerch.currency})`} value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" />
              <Input id="external_url" name="external_url" label="External URL" value={editedMerch.external_url} onChange={handleInputChange} />
              
              {/* New Button Text Input */}
              <Input id="button_text" name="button_text" label="Button Text (Default: View on Etsy)" value={editedMerch.button_text || ''} onChange={handleInputChange} />

              <div>
                  <label className="font-display text-sm text-gray-400 mb-2 block">Description (Rich Text)</label>
                  <QuillEditor
                    value={richDesc}
                    onChange={(val) => setRichDesc(val)}
                  />
              </div>

              <div className="flex items-center gap-4 pt-4">
                  <input type="checkbox" id="hidden" name="hidden" checked={editedMerch.hidden} onChange={handleInputChange} className="w-5 h-5 accent-fba-red" />
                  <label htmlFor="hidden" className="font-display uppercase text-sm">Hidden</label>
              </div>
          </div>

          <div className="pt-6 flex justify-end gap-4">
              <Button onClick={onClose} variant="secondary">Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default EditMerchModal;
