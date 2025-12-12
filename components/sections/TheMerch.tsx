import React, { useState, useRef } from 'react';
import { useAdmin } from '../../hooks/useAdmin.ts';
import RichTextViewer from '../ui/RichTextViewer.tsx';
import { MerchItem } from '../../types/index.ts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Portal from '../ui/Portal.tsx';

interface MerchCardProps {
    item: MerchItem;
}

const MerchCard: React.FC<MerchCardProps> = ({ item }) => {
    // Determine images array
    const images = item.image_urls && item.image_urls.length > 0 ? item.image_urls : [item.image_url];
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    
    // Parse description safely
    let descriptionBlocks: any[] = [];
    try {
        descriptionBlocks = JSON.parse(item.description);
        if (!Array.isArray(descriptionBlocks)) {
            // Fallback if not array
            descriptionBlocks = [{ type: 'paragraph', content: item.description }];
        }
    } catch (e) {
        descriptionBlocks = [{ type: 'paragraph', content: item.description }];
    }

    // Check if description is effectively empty (handling empty arrays, empty strings, and whitespace-only Quill deltas)
    const isDescriptionEmpty = !descriptionBlocks.length || (
        descriptionBlocks.length === 1 && (
            (descriptionBlocks[0].type === 'paragraph' && (!descriptionBlocks[0].content || !descriptionBlocks[0].content.trim())) ||
            (descriptionBlocks[0].type === 'quill-delta' && descriptionBlocks[0].delta?.ops?.every((op: any) => typeof op.insert === 'string' && !op.insert.trim()))
        )
    );

    const nextImage = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setCurrentImgIdx((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);
    };
    
    // Swipe handling
    const touchStartX = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        if (touchStartX.current - touchEndX > 50) nextImage();
        if (touchEndX - touchStartX.current > 50) prevImage();
    };

    return (
        <>
            <div 
                id={item.id}
                className="bg-[#0A0A0A] border border-gray-800 flex flex-col"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div 
                    className="relative w-full h-80 overflow-hidden bg-gray-900 group cursor-zoom-in"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => setIsLightboxOpen(true)}
                >
                    <img src={images[currentImgIdx]} alt={item.name} className="w-full h-full object-cover transition-opacity duration-300" />
                    
                    {/* Navigation Arrows (Always Visible) */}
                    {images.length > 1 && (
                        <>
                            <button 
                                onClick={prevImage}
                                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white hover:bg-black/80 z-10"
                                aria-label="Previous image"
                                type="button"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={nextImage}
                                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white hover:bg-black/80 z-10"
                                aria-label="Next image"
                                type="button"
                            >
                                <ChevronRight size={24} />
                            </button>
                            
                            {/* Mobile Indicator Dots */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 md:hidden">
                                {images.map((_, idx) => (
                                    <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentImgIdx ? 'bg-fba-red' : 'bg-white/50'}`} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="p-4 flex-grow flex flex-col">
                    <h2 className="font-display uppercase text-lg">{item.name}</h2>
                    <p className="font-mono text-fba-red text-xl my-2">
                        ${(item.price_cents / 100).toFixed(2)} {item.currency}
                    </p>
                    
                    {!isDescriptionEmpty && (
                        <div className="flex-grow mb-4 text-sm text-gray-400">
                            <RichTextViewer blocks={descriptionBlocks} />
                        </div>
                    )}

                    <a href={item.external_url} target="_blank" rel="noopener noreferrer" className="mt-auto block text-center w-full px-6 py-2 font-display text-sm uppercase transition-colors bg-fba-red text-fba-white hover:bg-red-700">
                        {item.button_text || "View on Etsy"}
                    </a>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <Portal>
                    <div 
                        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 cursor-zoom-out animate-fade-in"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsLightboxOpen(false);
                        }}
                    >
                        <img 
                            src={images[currentImgIdx]} 
                            alt={item.name} 
                            className="w-full h-auto max-h-screen object-contain shadow-2xl"
                        />
                    </div>
                </Portal>
            )}
        </>
    );
};

const TheMerch = () => {
    const { merch, loading } = useAdmin();

    const liveMerch = merch.filter(m => !m.hidden);

    if (loading && liveMerch.length === 0) {
        return <div className="font-display animate-pulse">LOADING MERCH...</div>;
    }

    return (
        <div className="w-full h-full overflow-y-auto px-4 py-4 custom-scrollbar">
            <h1 className="font-display text-2xl text-center uppercase mb-4">THE.MERCH</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {liveMerch.map(item => (
                    <MerchCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default TheMerch;