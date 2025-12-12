import React, { useRef, useEffect } from 'react';
import { Post } from '../../types/index.ts';

interface HatchTileProps {
  item: Post;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export const HatchTile: React.FC<HatchTileProps> = ({ item, children, isOpen, onToggle }) => {
  const articleRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && articleRef.current) {
      // The animations for opening/closing have a 500ms duration.
      // We wait slightly longer than that to ensure the layout is stable before scrolling.
      const timer = setTimeout(() => {
        articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Effect to control video playback based on the tile's open state.
  useEffect(() => {
    if (videoRef.current) {
      if (isOpen) {
        // Play the video when the tile is open.
        videoRef.current.play().catch(error => {
          // Log a warning if autoplay is prevented by the browser.
          console.warn('Video autoplay prevented:', error);
        });
      } else {
        // Pause and rewind the video when the tile is closed.
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  const renderHeaderMedia = () => {
    const commonClasses = `absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 ease-in-out`;
    
    // A 33.33% translate on a 100% height object means the middle third is shown.
    const openTransform = `scale(1.05) -translate-y-[33.33%]`; 
    const closedTransform = 'scale(1) translate-y-0';

    switch (item.header_media_type) {
      case 'image':
      case 'gif':
        return (
          <img 
            src={item.header_media_url} 
            alt="Post header" 
            className={`${commonClasses} ${isOpen ? openTransform : closedTransform}`}
          />
        );
      case 'video':
        return (
          <video 
            ref={videoRef}
            src={item.header_media_url} 
            className={`${commonClasses} ${isOpen ? openTransform : closedTransform}`}
            loop 
            muted 
            playsInline
          />
        );
      default:
        return null;
    }
  };

  return (
    <article ref={articleRef} className="mb-8 bg-[#0A0A0A] border border-gray-800 overflow-hidden max-w-xl mx-auto">
      {/* Header container that masks the image */}
      <div 
        className={`relative w-full overflow-hidden cursor-pointer transition-all duration-500 ease-in-out ${isOpen ? 'h-32' : 'aspect-square'}`}
        onClick={onToggle}
        role="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Collapse post' : 'Expand post'}
      >
        {renderHeaderMedia()}
      </div>

      {/* Content container that animates using max-height */}
      <div 
        className="transition-[max-height] duration-500 ease-in-out overflow-hidden"
        style={{ maxHeight: isOpen ? 'calc(100vh - 14rem)' : '0px' }}
      >
        {/* This inner div has a fixed height and handles internal scrolling */}
        <div 
          className="p-4 md:p-6 bg-fba-red hatch-inner-shadow text-fba-white overflow-y-auto flex items-center justify-center custom-scrollbar"
          style={{ height: 'calc(100vh - 14rem)'}}
        >
          {/* Inner Content Box: Black background, No Outline, Full Width Content */}
          <div className="w-full bg-black py-6 shadow-none [&_.ql-container.ql-snow]:!border-none">
            {children}
          </div>
        </div>
      </div>
    </article>
  );
};
