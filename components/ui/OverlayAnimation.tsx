import React, { useMemo } from 'react';
import { SiteSettings } from '../../types/index.ts';

interface OverlayAnimationProps { settings?: SiteSettings['overlay_animation']; }
type ParticleStyle = React.CSSProperties & Record<`--${string}`, string | number>;

const palette = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#ffffff', '#e10600'];
const leafPalette = ['#e9c46a', '#f4a261', '#e76f51', '#2a9d8f'];

const random = (seed: number) => {
  const value = Math.sin(seed * 999.91) * 43758.5453;
  return value - Math.floor(value);
};

const OverlayAnimation: React.FC<OverlayAnimationProps> = ({ settings }) => {
  const enabled = settings?.enabled ?? false;
  const type = settings?.type ?? 'snow';
  const speed = settings?.speed ?? 3;
  const density = settings?.density ?? 3;

  const particles = useMemo(() => {
    if (!enabled) return [];
    const isFireworks = type === 'fireworks';
    const count = isFireworks ? Math.max(24, density * 18) : Math.max(10, density * 14);
    const velocity = .55 + speed * .16;

    return Array.from({ length: count }, (_, index) => {
      const r1 = random(index + 1);
      const r2 = random(index + 101);
      const r3 = random(index + 211);
      const r4 = random(index + 307);
      const r5 = random(index + 401);
      let className = `overlay-particle overlay-${type}`;
      const style: ParticleStyle = {
        left: `${r1 * 100}%`,
        animationDelay: `${-r2 * (8 / velocity)}s`,
      };

      if (isFireworks) {
        const burstSize = Math.max(12, density * 6);
        const burstIndex = Math.floor(index / burstSize);
        const particleIndex = index % burstSize;
        const angle = (Math.PI * 2 * particleIndex) / burstSize;
        const distance = 45 + r3 * 95;
        style.left = `${15 + random(burstIndex + 33) * 70}%`;
        style.top = `${12 + random(burstIndex + 71) * 45}%`;
        style['--burst-x'] = `${Math.cos(angle) * distance}px`;
        style['--burst-y'] = `${Math.sin(angle) * distance}px`;
        style['--particle-color'] = palette[Math.floor(r4 * palette.length)];
        style.animationDuration = `${Math.max(2.8, 7.2 / velocity)}s`;
        style.animationDelay = `${-(burstIndex * 1.35 + r5 * 2)}s`;
      } else if (type === 'sparkles') {
        style.top = `${r2 * 100}%`;
        style['--particle-size'] = `${2 + r3 * 3}px`;
        style.animationDuration = `${Math.max(.7, 2.8 / velocity)}s`;
      } else {
        style['--drift'] = `${(r3 - .5) * (type === 'rain' ? 45 : 140)}px`;
        style['--particle-size'] = `${type === 'leaves' ? 6 + r4 * 7 : type === 'confetti' ? 4 + r4 * 5 : 2 + r4 * 4}px`;
        style['--particle-color'] = type === 'leaves'
          ? leafPalette[Math.floor(r5 * leafPalette.length)]
          : type === 'confetti'
            ? palette[Math.floor(r5 * palette.length)]
            : `rgba(255,255,255,${.3 + r5 * .55})`;
        const baseDuration = type === 'rain' ? 2.2 : type === 'confetti' ? 5.5 : type === 'leaves' ? 7.5 : 9;
        style.animationDuration = `${baseDuration / velocity}s`;
      }

      return { id: index, className, style };
    });
  }, [enabled, type, speed, density]);

  if (!enabled) return null;

  return <>
    <div className="overlay-effects pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {particles.map(particle => <span key={particle.id} className={particle.className} style={particle.style} />)}
    </div>
    <style>{`
      .overlay-particle {
        position: absolute;
        display: block;
        pointer-events: none;
      }
      .overlay-snow,
      .overlay-leaves,
      .overlay-confetti,
      .overlay-rain {
        top: -12vh;
        animation-name: overlay-fall;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }
      .overlay-snow {
        width: var(--particle-size);
        height: var(--particle-size);
        border-radius: 999px;
        background: var(--particle-color);
      }
      .overlay-leaves {
        width: calc(var(--particle-size) * 1.8);
        height: var(--particle-size);
        border-radius: 100% 0 100% 0;
        background: var(--particle-color);
      }
      .overlay-confetti {
        width: var(--particle-size);
        height: calc(var(--particle-size) * 2.2);
        background: var(--particle-color);
      }
      .overlay-rain {
        width: 1px;
        height: 18px;
        background: rgba(160,205,255,.68);
        animation-name: overlay-rain-fall;
      }
      .overlay-sparkles {
        top: var(--sparkle-top, 0);
        width: calc(var(--particle-size) * 5);
        height: 1px;
        background: rgba(255,255,255,.85);
        animation: overlay-twinkle 2s ease-in-out infinite;
      }
      .overlay-sparkles::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 1px;
        height: calc(var(--particle-size) * 5);
        background: rgba(255,255,255,.85);
        transform: translate(-50%, -50%);
      }
      .overlay-fireworks {
        width: 3px;
        height: 3px;
        border-radius: 999px;
        background: var(--particle-color);
        animation-name: overlay-burst;
        animation-timing-function: ease-out;
        animation-iteration-count: infinite;
      }
      @keyframes overlay-fall {
        from { transform: translate3d(0, -12vh, 0) rotate(0deg); }
        to { transform: translate3d(var(--drift), 124vh, 0) rotate(540deg); }
      }
      @keyframes overlay-rain-fall {
        from { transform: translate3d(0, -12vh, 0) rotate(12deg); }
        to { transform: translate3d(var(--drift), 124vh, 0) rotate(12deg); }
      }
      @keyframes overlay-twinkle {
        0%, 100% { opacity: .08; transform: scale(.3); }
        50% { opacity: 1; transform: scale(1); }
      }
      @keyframes overlay-burst {
        0%, 16% { opacity: 0; transform: translate3d(0,0,0) scale(.4); }
        18% { opacity: 1; transform: translate3d(0,0,0) scale(1); }
        42% { opacity: 0; transform: translate3d(var(--burst-x),var(--burst-y),0) scale(.2); }
        43%, 100% { opacity: 0; transform: translate3d(var(--burst-x),var(--burst-y),0) scale(.2); }
      }
      @media (prefers-reduced-motion: reduce) {
        .overlay-effects { display: none; }
      }
    `}</style>
  </>;
};

export default OverlayAnimation;
