import React, { useState } from 'react';
import Portal from '../ui/Portal.tsx';
import Input from '../ui/Input.tsx';
import Button from '../ui/Button.tsx';
import FilePicker from '../ui/FilePicker.tsx';
import { X } from 'lucide-react';
import { SiteSettings } from '../../types/index.ts';
import LoadingImage from '../ui/LoadingImage.tsx';

interface EditPromoModalProps {
    settings: SiteSettings['promo'];
    onClose: () => void;
    onSave: (promo: SiteSettings['promo']) => void;
}

const EditPromoModal: React.FC<EditPromoModalProps> = ({ settings, onClose, onSave }) => {
    const [enabled, setEnabled] = useState(settings?.enabled || false);
    const [imageUrl, setImageUrl] = useState(settings?.image_url || '');
    const [linkUrl, setLinkUrl] = useState(settings?.link_url || '');

    const handleSave = () => {
        onSave({
            enabled,
            image_url: imageUrl,
            link_url: linkUrl
        });
        onClose();
    };

    return (
        <Portal>
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="bg-[#0A0A0A] border-2 border-gray-800 w-full max-w-lg text-fba-white flex flex-col max-h-[90vh] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - Fixed */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-800 flex-shrink-0">
                        <h2 className="font-display text-lg uppercase">Edit Promo Banner</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow">
                        <div className="flex items-center gap-4 border border-gray-800 p-4 bg-black/50">
                            <input
                                type="checkbox"
                                id="promo-enabled"
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                                className="w-5 h-5 accent-fba-red flex-shrink-0"
                            />
                            <label htmlFor="promo-enabled" className="font-display uppercase text-sm cursor-pointer select-none">
                                Enable Promo Pop-up
                            </label>
                        </div>

                        <FilePicker
                            label="Promo Image"
                            currentUrl={imageUrl}
                            onUrlChange={setImageUrl}
                            bucket="media"
                        />
                        {imageUrl && (
                            <div className="aspect-video w-full border border-gray-700 bg-black flex items-center justify-center overflow-hidden flex-shrink-0">
                                <LoadingImage 
                                    src={imageUrl} 
                                    alt="Promo preview" 
                                    containerClassName="w-full h-full flex items-center justify-center"
                                    className="max-h-full max-w-full object-contain" 
                                />
                            </div>
                        )}

                        <Input
                            id="promo-link"
                            label="Target URL (Optional)"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://..."
                        />
                        
                        <p className="text-xs text-gray-500">
                            When enabled, this image will appear as a 90% screen overlay when users first visit the homepage.
                            Users can close it, and it will not reappear until they refresh the page.
                        </p>
                    </div>

                    {/* Footer - Fixed */}
                    <div className="p-6 border-t border-gray-800 flex justify-end gap-4 flex-shrink-0 bg-[#0A0A0A]">
                        <Button onClick={onClose} variant="secondary">Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default EditPromoModal;