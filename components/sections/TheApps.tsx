import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin.ts';
import { AppItem } from '../../types/index.ts';
import RichTextViewer from '../ui/RichTextViewer.tsx';

const AppCard: React.FC<{ app: AppItem; open: boolean; onOpen: () => void; onClose: () => void; includeId?: boolean }> = ({ app, open, onOpen, onClose, includeId = true }) => {
  const description = app.body_richtext.filter(block => block.type !== 'image');
  const primaryLink = app.links[0];

  const handleAction = () => {
    if (!open) return onOpen();
    if (primaryLink?.url) window.open(primaryLink.url, '_blank', 'noopener,noreferrer');
  };

  return <article id={includeId ? app.id : undefined} className={`relative flex overflow-hidden border bg-[#0A0A0A] transition-[height,padding,gap,border-color] duration-500 ease-in-out ${open ? 'h-[min(calc(100dvh-10rem),46rem)] w-full gap-0 border-fba-red p-0' : 'h-56 w-full items-stretch gap-4 border-gray-800 p-4 md:h-72'}`}>
    <div className={`flex-shrink-0 overflow-hidden bg-[#0A0A0A] transition-[width] duration-500 ease-in-out ${open ? 'w-1/3' : 'w-32 md:w-[10.667rem]'}`}>
      <img src={app.icon_url} alt={`${app.name} poster`} className="block h-full w-full object-cover object-center" />
    </div>

    <div className={`relative flex min-w-0 flex-1 flex-col transition-[padding] duration-500 ease-in-out ${open ? 'p-4 pt-12' : 'p-0'}`}>
      <button type="button" onClick={onClose} className={`absolute right-0 top-0 z-30 rounded-full bg-black/80 p-2 transition-opacity duration-300 ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} aria-label="Close app details"><X size={20} /></button>
      <h2 className={`flex-shrink-0 font-display uppercase leading-relaxed transition-[font-size,margin] duration-500 ${open ? 'mb-4 text-sm' : 'mb-0 text-[10px]'}`}>{app.name}</h2>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <p className={`absolute inset-0 my-3 line-clamp-4 text-sm text-gray-400 transition-opacity duration-300 ${open ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>{app.short_desc}</p>
        <div className={`absolute inset-0 overflow-y-auto pr-2 transition-opacity duration-300 custom-scrollbar [&_.ql-container.ql-snow]:!border-none ${open ? 'opacity-100 delay-150' : 'pointer-events-none opacity-0'}`}>
          {description.length ? <RichTextViewer blocks={description} /> : <p className="text-sm text-gray-400">{app.short_desc}</p>}
        </div>
      </div>

      <button type="button" onClick={handleAction} className="mt-3 flex-shrink-0 self-start bg-fba-red px-3 py-2 font-mono text-xs uppercase transition-[width] duration-500 hover:bg-red-700">
        {open ? (primaryLink?.label || 'Go to Site') : 'Learn More'}
      </button>
    </div>
  </article>;
};

const TheApps = () => {
  const { apps, loading } = useAdmin();
  const [openId, setOpenId] = useState<string | null>(null);
  const [isElevated, setIsElevated] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const closeTimer = useRef<number>();
  const touchStartY = useRef(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const liveApps = apps.filter(app => !app.hidden);
  const appPages = liveApps.reduce<AppItem[][]>((pages, app, index) => {
    if (index % 2 === 0) pages.push([]);
    pages[pages.length - 1].push(app);
    return pages;
  }, []);

  const beginOpen = (appId: string) => {
    const source = listRef.current?.querySelector<HTMLElement>(`[data-app-card-id="${CSS.escape(appId)}"]`);
    const list = listRef.current;
    if (!source || !list) return;
    const sourceRect = source.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const top = (headingRef.current?.getBoundingClientRect().bottom || listRect.top) + 16;
    setOriginRect(sourceRect);
    setTargetRect(new DOMRect(listRect.left, top, listRect.width, sourceRect.height));
    setOpenId(appId);
    setIsElevated(false);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setIsElevated(true)));
  };

  const beginClose = () => {
    setIsElevated(false);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setOpenId(null);
      setOriginRect(null);
      setTargetRect(null);
    }, 520);
  };

  useEffect(() => {
    const close = () => {
      window.clearTimeout(closeTimer.current);
      setIsElevated(false);
      setOpenId(null);
      setOriginRect(null);
      setTargetRect(null);
    };
    window.addEventListener('fba:navigate', close);
    return () => window.removeEventListener('fba:navigate', close);
  }, []);

  useEffect(() => {
    const resetWhenLeaving = (event: Event) => {
      if ((event as CustomEvent<{ sectionId: string }>).detail?.sectionId === 'the-apps') return;
      window.clearTimeout(closeTimer.current);
      setIsElevated(false);
      setOpenId(null);
      setOriginRect(null);
      setTargetRect(null);
      scrollerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('fba:active-section', resetWhenLeaving);
    return () => window.removeEventListener('fba:active-section', resetWhenLeaving);
  }, []);

  if (loading && !liveApps.length) return <div className="font-display animate-pulse">LOADING APPS...</div>;
  return <div
    ref={scrollerRef}
    style={{ overflowAnchor: 'none' }}
    className="relative h-full w-full snap-y snap-mandatory overflow-y-auto px-4 py-4 custom-scrollbar md:snap-none"
    onTouchStart={event => { touchStartY.current = event.touches[0].clientY; }}
    onTouchEnd={event => {
      if (openId || window.innerWidth >= 768) return;
      const scroller = scrollerRef.current;
      const swipeDistance = touchStartY.current - event.changedTouches[0].clientY;
      const upwardSwipe = swipeDistance > 45;
      const downwardSwipe = swipeDistance < -45;
      const atBottom = !!scroller && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 8;
      const atTop = !!scroller && scroller.scrollTop <= 8;
      if (upwardSwipe && atBottom) {
        window.dispatchEvent(new CustomEvent('fba:request-section', { detail: { sectionId: 'the-info' } }));
      } else if (downwardSwipe && atTop) {
        window.dispatchEvent(new CustomEvent('fba:request-section', { detail: { sectionId: 'the-merch' } }));
      }
    }}
  >
    <h1 ref={headingRef} className="sticky top-0 z-20 mb-4 bg-fba-black/95 py-1 text-center font-display text-2xl uppercase">THE.APPS</h1>
    {openId && <button type="button" className={`fixed inset-0 z-[25] cursor-default bg-black/75 transition-opacity duration-300 ${isElevated ? 'opacity-100' : 'opacity-0'}`} onClick={beginClose} aria-label="Close app details overlay" />}
    <div ref={listRef} className="app-list relative mx-auto max-w-2xl">{appPages.map((page, pageIndex) => <div key={pageIndex} className="app-page">{page.map(app => <div key={app.id} data-app-card-id={app.id} className={`relative transition-opacity duration-300 ${openId === app.id ? 'opacity-0' : openId ? 'opacity-25' : 'opacity-100'}`}><AppCard app={app} open={false} onOpen={() => beginOpen(app.id)} onClose={() => undefined} /></div>)}</div>)}</div>
    {openId && originRect && targetRect && (() => {
      const app = liveApps.find(item => item.id === openId);
      if (!app) return null;
      const rect = isElevated ? targetRect : originRect;
      return <div className="fixed z-[30] transition-[top,left,width] duration-500 ease-in-out" style={{ top: rect.top, left: rect.left, width: rect.width }}>
        <AppCard app={app} open={isElevated} onOpen={() => undefined} onClose={beginClose} includeId={false} />
      </div>;
    })()}
  </div>;
};

export default TheApps;
