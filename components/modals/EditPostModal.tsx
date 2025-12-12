import React, { useState, useEffect, useRef } from 'react';
import { Post } from '../../types/index.ts';
import Button from '../ui/Button.tsx';
import Input from '../ui/Input.tsx';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import QuillEditor from '../ui/QuillEditor.tsx';
import Portal from '../ui/Portal.tsx';
import { toSquareDataURL } from '../../src/edit/imageSquare.ts';
import { uploadFile } from '../../utils/storage.ts';
import { useAdmin } from '../../hooks/useAdmin.ts';

interface EditPostModalProps {
  post: Post | null;
  onClose: () => void;
  onSave: (updatedPost: Post) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSave }) => {
  const [editedPost, setEditedPost] = useState<Post | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { supabaseClient } = useAdmin();

  useEffect(() => {
    if (post) {
      setEditedPost(post);
    } else {
      setEditedPost(null);
    }
  }, [post]);

  if (!editedPost) return null;

  const handleGenericChange = (update: Partial<Post>) => {
    setEditedPost(prev => prev ? { ...prev, ...update } : null);
  };
  
  const detectMediaType = (url: string): 'image' | 'gif' | 'video' => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.gif')) return 'gif';
    if (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.mov')) return 'video';
    return 'image';
  };

  const handleSave = () => {
    if (editedPost) {
        const header_media_type = detectMediaType(editedPost.header_media_url);
        // External links are removed from UI but kept in state if they existed, or empty.
        // We aren't deleting the field from the object, just not editing it.
        const finalPost = { ...editedPost, header_media_type };

        if (!finalPost.title) {
            toast.error("Title is required.");
            return;
        }
        if (!finalPost.header_media_url) {
            toast.error("Header Media URL is required.");
            return;
        }

        onSave(finalPost);
        onClose();
    }
  };

  const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Processing & Uploading Header...');
    try {
        let fileToUpload = file;
        // Auto-square crop if image
        if (file.type.startsWith('image/') && !file.type.includes('gif')) {
           const { blob, name } = await toSquareDataURL(file);
           fileToUpload = new File([blob], name, { type: 'image/png' });
        }

        const url = await uploadFile(fileToUpload, supabaseClient, 'media');
        handleGenericChange({ header_media_url: url });
        toast.success('Header uploaded!', { id: toastId });
    } catch (err: any) {
        toast.error(`Upload failed. Check console.`, { id: toastId });
    } finally {
        setIsUploading(false);
        if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Portal>
      {/* TRUE MODAL: Removed onClose from overlay click. Added e.stopPropagation on container. */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 animate-fade-in overflow-y-auto"
      >
        <div
          className="bg-[#0A0A0A] border-2 border-gray-800 p-6 w-full max-w-2xl text-fba-white relative mt-16 mb-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-lg uppercase">Edit Post</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
              </button>
          </div>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <Input
                id="title"
                name="title"
                label="Post Title"
                value={editedPost.title}
                onChange={(e) => handleGenericChange({ title: e.target.value })}
              />
              
              {/* Specialized Header Media Picker with Square Crop */}
              <div>
                  <Input 
                    id="header_media_url" 
                    label="Header Media URL (Square)" 
                    value={editedPost.header_media_url} 
                    onChange={(e) => handleGenericChange({ header_media_url: e.target.value })} 
                    placeholder="https://... or upload"
                  />
                  <input type="file" ref={fileInputRef} onChange={handleHeaderUpload} style={{ display: 'none' }} accept="image/*,video/*" />
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="mt-2 text-xs">
                      {isUploading ? 'Processing...' : `Upload Square Header`}
                  </Button>
                  <p className="text-[10px] text-gray-500 mt-1">Images are automatically center-cropped to square.</p>
              </div>
              
              <div>
                <label className="font-display text-sm text-gray-400 mb-2 block">Body Content</label>
                <QuillEditor
                  value={editedPost.body_richtext}
                  onChange={(body) => handleGenericChange({ body_richtext: body })}
                />
              </div>

              {/* Removed External Links JSON Textarea */}

              <div className="flex items-center gap-4 pt-4">
                  <input
                      type="checkbox"
                      id="hidden"
                      name="hidden"
                      checked={editedPost.hidden}
                      onChange={(e) => handleGenericChange({ hidden: e.target.checked })}
                      className="w-5 h-5 accent-fba-red"
                  />
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

export default EditPostModal;
