import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HatchTile } from '../ui/HatchTile.tsx';
import RichTextViewer from '../ui/RichTextViewer.tsx';
import { useAdmin } from '../../hooks/useAdmin.ts';
import { Post } from '../../types/index.ts';

const PostContents: React.FC<{ post: Post }> = ({ post }) => <div className="space-y-6">
  <RichTextViewer blocks={post.body_richtext} />
  {post.external_links?.length > 0 && <div>
    <h4 className="mb-3 border-b-2 border-fba-white/50 pb-2 font-display uppercase">Links</h4>
    <ul className="space-y-2">{post.external_links.map((link, index) => <li key={index}><a href={link.url} target="_blank" rel="noopener noreferrer" className="font-mono text-fba-white hover:underline">{link.label}</a></li>)}</ul>
  </div>}
</div>;

const TheScrl = () => {
  const { posts, loading } = useAdmin();
  const livePosts = posts.filter(post => !post.hidden);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [trackIndex, setTrackIndex] = useState(1);
  const [animated, setAnimated] = useState(true);
  const touchStartY = useRef(0);
  const wheelLocked = useRef(false);
  const slideLocked = useRef(false);

  const slides = useMemo(() => {
    if (livePosts.length <= 1) return livePosts;
    return [livePosts[livePosts.length - 1], ...livePosts, livePosts[0]];
  }, [livePosts]);

  useEffect(() => {
    setTrackIndex(livePosts.length > 1 ? 1 : 0);
    setAnimated(false);
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, [livePosts.length]);

  useEffect(() => {
    const closeOnNavigate = () => setOpenPostId(null);
    window.addEventListener('fba:navigate', closeOnNavigate);
    return () => window.removeEventListener('fba:navigate', closeOnNavigate);
  }, []);

  useEffect(() => {
    const resetWhenLeaving = (event: Event) => {
      if ((event as CustomEvent<{ sectionId: string }>).detail?.sectionId === 'the-scrl') return;
      setOpenPostId(null);
      setAnimated(false);
      setTrackIndex(livePosts.length > 1 ? 1 : 0);
      slideLocked.current = false;
      window.requestAnimationFrame(() => setAnimated(true));
    };
    window.addEventListener('fba:active-section', resetWhenLeaving);
    return () => window.removeEventListener('fba:active-section', resetWhenLeaving);
  }, [livePosts.length]);

  const move = (direction: 1 | -1) => {
    if (openPostId || livePosts.length <= 1 || slideLocked.current) return;
    slideLocked.current = true;
    setAnimated(true);
    setTrackIndex(index => index + direction);
  };

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
    if (livePosts.length <= 1) return;
    if (trackIndex === 0) {
      setAnimated(false);
      setTrackIndex(livePosts.length);
    } else if (trackIndex === livePosts.length + 1) {
      setAnimated(false);
      setTrackIndex(1);
    }
    slideLocked.current = false;
  };

  const togglePost = (postId: string) => {
    setAnimated(false);
    setOpenPostId(current => current === postId ? null : postId);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setAnimated(true)));
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (openPostId || Math.abs(event.deltaY) < 20 || wheelLocked.current) return;
    event.preventDefault();
    event.stopPropagation();
    wheelLocked.current = true;
    move(event.deltaY > 0 ? 1 : -1);
    window.setTimeout(() => { wheelLocked.current = false; }, 550);
  };

  if (loading && livePosts.length === 0) return <div className="font-display animate-pulse">LOADING SCRL...</div>;
  if (livePosts.length === 0) return <div className="font-display">NO POSTS YET.</div>;

  return <div className="flex h-full w-full flex-col px-4 py-4">
    <h1 className="mb-4 flex-shrink-0 text-center font-display text-2xl uppercase">THE.SCRL</h1>
    <div
      className={`scrl-carousel mx-auto w-full max-w-xl overflow-hidden ${openPostId ? 'is-open' : ''}`}
      style={{ touchAction: openPostId ? 'pan-y' : 'pan-x' }}
      onWheel={handleWheel}
      onTouchStart={event => { touchStartY.current = event.touches[0].clientY; }}
      onTouchEnd={event => {
        const distance = touchStartY.current - event.changedTouches[0].clientY;
        if (Math.abs(distance) > 45) move(distance > 0 ? 1 : -1);
      }}
    >
      <div
        className={`h-full ${animated ? 'transition-transform duration-500 ease-in-out' : ''}`}
        style={{ transform: `translateY(-${trackIndex * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((post, slideIndex) => <div key={`${post.id}-${slideIndex}`} className="flex h-full items-start justify-center">
          <HatchTile item={post} isOpen={openPostId === post.id} onToggle={() => togglePost(post.id)}>
            <PostContents post={post} />
          </HatchTile>
        </div>)}
      </div>
    </div>
    {livePosts.length > 1 && !openPostId && <p className="mt-2 flex-shrink-0 text-center font-mono text-[10px] uppercase text-gray-500">Swipe up or down</p>}
  </div>;
};

export default TheScrl;
