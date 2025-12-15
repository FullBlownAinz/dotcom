import React, { useState } from 'react';
import Portal from './Portal.tsx';
import { X } from 'lucide-react';
import { SiteSettings } from '../../types/index.ts';
import LoadingImage from './LoadingImage.tsx';

interface PromoPopupProps {
    settings?: SiteSettings['promo'];
}

const PromoPopup: React.FC<PromoPopupProps> = ({ settings }) => {
    // Only show if enabled, has image, and hasn't been closed in this session
    const [isVisible, setIsVisible] = useState(true);

    if (!settings?.enabled || !settings.image_url || !isVisible) {
        return null;
    }

    const handleClose = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsVisible(false);
    };

    return (
        <Portal>
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
                onClick={handleClose}
            >
                <div 
                    className="relative w-[90%] h-[90%] flex items-center justify-center pointer-events-auto"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the content area
                >
                    {/* Close Button */}
                    <button 
                        onClick={handleClose}
                        className="absolute -top-4 -right-4 z-50 bg-fba-red text-white p-2 rounded-full border-2 border-black hover:bg-red-700 transition-colors shadow-lg"
                        aria-label="Close promo"
                    >
                        <X size={24} />
                    </button>

                    {/* Content */}
                    <div className="w-full h-full relative flex items-center justify-center">
                        {settings.link_url ? (
                            <a 
                                href={settings.link_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full h-full flex items-center justify-center"
                            >
                                <LoadingImage 
                                    src={settings.image_url} 
                                    alt="Promo" 
                                    containerClassName="w-full h-full flex items-center justify-center"
                                    className="max-w-full max-h-full object-contain drop-shadow-2xl" 
                                />
                            </a>
                        ) : (
                            <LoadingImage 
                                src={settings.image_url} 
                                alt="Promo" 
                                containerClassName="w-full h-full flex items-center justify-center"
                                className="max-w-full max-h-full object-contain drop-shadow-2xl" 
                            />
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default PromoPopup;