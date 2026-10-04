import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin.ts';
import RichTextViewer from '../ui/RichTextViewer.tsx';
import { MerchItem } from '../../types/index.ts';
import Portal from '../ui/Portal.tsx';
import LoadingImage from '../ui/LoadingImage.tsx';

const parseDescription = (description: string) => {
  try {
    const parsed = JSON.parse(description);
    return Array.isArray(parsed) ? parsed : [{ type: 'paragraph', content: description }];
  } catch {
    return description ? [{ type: 'paragraph', content: description }] : [];
  }
};

const FittedTitle: React.FC<{ text: string }> = ({ text }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let size = 18;
    el.style.fontSize = `${size}px`;
    while (el.scrollWidth > el.clientWidth && size > 9) el.style.fontSize = `${--size}px`;
  }, [text]);
  return <h2 ref={ref} className="overflow-hidden whitespace-nowrap font-display uppercase leading-tight">{text}</h2>;
};

const MerchCard: React.FC<{ item: MerchItem }> = ({ item }) => {
  const images = item.image_urls?.length ? item.image_urls : [item.image_url];
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const descriptionBlocks = parseDescription(item.description);
  const touchStartX = useRef(0);
  const move = (amount: number) => setCurrentImgIdx(i => (i + amount + images.length) % images.length);

  useEffect(() => {
    const close = () => setIsOpen(false);
    window.addEventListener('fba:navigate', close);
    return () => window.removeEventListener('fba:navigate', close);
  }, []);

  const gallery = (
    <div className="relative h-full w-full overflow-hidden bg-gray-900" onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }} onTouchEnd={e => { const d = touchStartX.current - e.changedTouches[0].clientX; if (Math.abs(d) > 50) move(d > 0 ? 1 : -1); }}>
      <button type="button" className="h-full w-full cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
        <LoadingImage src={images[currentImgIdx]} alt={`${item.name} ${currentImgIdx + 1}`} containerClassName="h-full w-full" className="h-full w-full object-cover" />
      </button>
      {images.length > 1 && <>
        <button type="button" onClick={() => move(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/60 p-2" aria-label="Previous image"><ChevronLeft /></button>
        <button type="button" onClick={() => move(1)} className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/60 p-2" aria-label="Next image"><ChevronRight /></button>
      </>}
    </div>
  );

  return <>
    <article id={item.id} className={`merch-flip-card ${isOpen ? 'is-open' : ''}`}>
      <div className="flip-card-inner">
        <div className="flip-card-face flip-card-front flex cursor-pointer flex-col border border-gray-800 bg-[#0A0A0A]" role="button" tabIndex={0} onClick={() => setIsOpen(true)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(true); } }} aria-label={`More information about ${item.name}`}>
          <div className="min-h-0 flex-1"><LoadingImage src={images[0]} alt={item.name} containerClassName="h-full w-full" className="h-full w-full object-cover" /></div>
          <div className="flex-shrink-0 p-4">
            <FittedTitle text={item.name} />
            {!item.hide_price && <p className="my-2 font-mono text-xl text-fba-red">${(item.price_cents / 100).toFixed(2)} {item.currency}</p>}
            <button type="button" onClick={() => setIsOpen(true)} className="mt-2 w-full bg-fba-red px-6 py-2 font-display text-sm uppercase hover:bg-red-700">More Info</button>
          </div>
        </div>
        <div className="flip-card-face flip-card-back flex flex-col border border-fba-red bg-black">
          <button type="button" onClick={() => setIsOpen(false)} className="absolute right-2 top-2 z-20 rounded-full bg-black/80 p-2" aria-label="Close product details"><X size={20} /></button>
          <div className="h-1/2 flex-shrink-0">{gallery}</div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-black p-4 custom-scrollbar [&_.ql-container.ql-snow]:!border-none"><RichTextViewer blocks={descriptionBlocks} /></div>
          <a href={item.external_url} target="_blank" rel="noopener noreferrer" className="m-4 mt-0 block flex-shrink-0 bg-fba-red px-6 py-2 text-center font-display text-sm uppercase hover:bg-red-700">{item.button_text || 'View on Etsy'}</a>
        </div>
      </div>
    </article>
    {isLightboxOpen && <Portal><button type="button" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-2" onClick={() => setIsLightboxOpen(false)} aria-label="Close enlarged image"><LoadingImage src={images[currentImgIdx]} alt={item.name} containerClassName="max-h-screen max-w-full" className="max-h-screen max-w-full object-contain" /></button></Portal>}
  </>;
};

const TheMerch = () => {
  const { merch, loading } = useAdmin();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [resetVersion, setResetVersion] = useState(0);
  const liveMerch = merch.filter(m => !m.hidden);
  useEffect(() => {
    const resetWhenLeaving = (event: Event) => {
      if ((event as CustomEvent<{ sectionId: string }>).detail?.sectionId === 'the-merch') return;
      carouselRef.current?.scrollTo({ left: 0, behavior: 'auto' });
      setResetVersion(version => version + 1);
    };
    window.addEventListener('fba:active-section', resetWhenLeaving);
    return () => window.removeEventListener('fba:active-section', resetWhenLeaving);
  }, []);
  if (loading && !liveMerch.length) return <div className="font-display animate-pulse">LOADING MERCH...</div>;
  return <div className="h-full w-full overflow-y-auto px-4 py-4 custom-scrollbar">
    <h1 className="mb-4 text-center font-display text-2xl uppercase">THE.MERCH</h1>
    <div ref={carouselRef} className="mx-auto flex max-w-6xl snap-x snap-mandatory gap-6 overflow-x-auto pb-4 custom-scrollbar">
      {liveMerch.map(item => <div key={`${item.id}-${resetVersion}`} className="w-[min(82vw,22rem)] flex-none snap-center"><MerchCard item={item} /></div>)}
    </div>
  </div>;
};

export default TheMerch;
