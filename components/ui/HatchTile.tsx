import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Post } from '../../types/index.ts';
import LoadingImage from './LoadingImage.tsx';

interface HatchTileProps {
  item: Post;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export const HatchTile: React.FC<HatchTileProps> = ({ item, children, isOpen, onToggle }) => {
  const articleRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timer: number;
    let finishTimer: number;
    if (isOpen) {
      setIsAnimating(true);
      setIsFlipped(true);
      timer = window.setTimeout(() => setIsExpanded(true), 420);
      finishTimer = window.setTimeout(() => setIsAnimating(false), 900);
    } else {
      setIsExpanded(false);
      timer = window.setTimeout(() => {
        setIsAnimating(true);
        setIsFlipped(false);
      }, 420);
      finishTimer = window.setTimeout(() => setIsAnimating(false), 1000);
    }
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(finishTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isOpen) videoRef.current.pause();
    else videoRef.current.play().catch(() => undefined);
  }, [isOpen]);

  const media = item.header_media_type === 'video' ? (
    <video ref={videoRef} src={item.header_media_url} className="h-full w-full object-cover" loop muted playsInline autoPlay preload="auto" />
  ) : (
    <LoadingImage src={item.header_media_url} alt={item.title || 'Post header'} containerClassName="h-full w-full" className="h-full w-full object-cover" />
  );

  return (
    <article ref={articleRef} className={`flip-card mx-auto mb-8 w-full max-w-xl ${isFlipped ? 'is-flipped' : ''} ${isExpanded ? 'is-expanded' : ''} ${isAnimating ? 'is-animating' : ''}`}>
      <div className="flip-card-inner">
        <div className="flip-card-face flip-card-front cursor-pointer overflow-hidden border border-gray-800 bg-[#0A0A0A] text-left" onClick={onToggle} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onToggle(); } }} role="button" tabIndex={0} aria-expanded={isOpen} aria-label={`Open ${item.title || 'post'}`}>
          {media}
        </div>
        <div className="flip-card-face flip-card-back border border-fba-red bg-black text-fba-white">
          <button type="button" onClick={onToggle} className="absolute right-2 top-2 z-10 rounded-full bg-black/80 p-2 text-white hover:text-fba-red" aria-label="Close post"><X size={20} /></button>
          <div className="h-full overflow-y-auto custom-scrollbar p-4 pt-12 [&_.ql-container.ql-snow]:!border-none">{children}</div>
        </div>
      </div>
    </article>
  );
};
