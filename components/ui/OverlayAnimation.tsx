import React, { useEffect, useRef } from 'react';
import { SiteSettings } from '../../types/index.ts';

interface OverlayAnimationProps { settings?: SiteSettings['overlay_animation']; }
interface Particle { x: number; y: number; radius: number; color: string; speedX: number; speedY: number; rotation: number; rotationSpeed: number; life?: number; maxLife?: number; }

const colors = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#ffffff', '#e10600'];

const createParticle = (w: number, h: number, type: string, speed: number, top = false): Particle => {
  const factor = .35 + speed * .2;
  const x = Math.random() * w;
  const y = top ? -20 : Math.random() * h;
  if (type === 'rain') return { x, y, radius: 1, color: 'rgba(160,205,255,.65)', speedY: (8 + Math.random() * 8) * factor, speedX: -1, rotation: 0, rotationSpeed: 0 };
  if (type === 'sparkles') return { x, y, radius: 1 + Math.random() * 2, color: '#fff', speedY: 0, speedX: 0, rotation: Math.random() * Math.PI, rotationSpeed: .03 * factor, life: Math.random() * 100, maxLife: 100 };
  if (type === 'leaves') return { x, y, radius: 3 + Math.random() * 3, color: ['#e9c46a','#f4a261','#e76f51','#2a9d8f'][Math.floor(Math.random()*4)], speedY: (1 + Math.random()*1.5)*factor, speedX: Math.random(), rotation: Math.random()*Math.PI*2, rotationSpeed: Math.random()*.05-.025 };
  if (type === 'confetti') return { x, y, radius: 2 + Math.random()*2, color: colors[Math.floor(Math.random()*colors.length)], speedY: (2 + Math.random()*3)*factor, speedX: Math.random()*2, rotation: Math.random()*Math.PI*2, rotationSpeed: Math.random()*.1 };
  return { x, y, radius: 1 + Math.random()*2, color: `rgba(255,255,255,${.3+Math.random()*.5})`, speedY: (.5+Math.random())*factor, speedX: Math.random()*.5, rotation: Math.random()*Math.PI*2, rotationSpeed: Math.random()*.02 };
};

const OverlayAnimation: React.FC<OverlayAnimationProps> = ({ settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !settings?.enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    let raf = 0;
    let particles: Particle[] = [];
    const speed = settings.speed ?? 3;
    const density = settings.density ?? 3;
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    const reset = () => {
      const count = Math.round((innerWidth < 768 ? 10 : 20) * density);
      particles = settings.type === 'fireworks' ? [] : Array.from({ length: count }, () => createParticle(canvas.width, canvas.height, settings.type, speed));
    };
    const burst = () => {
      const cx = canvas.width * (.15 + Math.random() * .7), cy = canvas.height * (.1 + Math.random() * .5);
      const count = 14 + density * 7;
      for (let i=0; i<count; i++) {
        const a = Math.PI * 2 * i / count, velocity = (1.5 + Math.random()*3) * (.5 + speed*.16);
        particles.push({ x:cx, y:cy, radius:1.5, color:colors[Math.floor(Math.random()*colors.length)], speedX:Math.cos(a)*velocity, speedY:Math.sin(a)*velocity, rotation:0, rotationSpeed:0, life:0, maxLife:45+speed*8 });
      }
    };
    const animate = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height); frame++;
      if (settings.type === 'fireworks' && frame % Math.max(30, 160-density*20) === 0) burst();
      particles = particles.filter((p, i) => {
        if (settings.type === 'fireworks') {
          p.life = (p.life || 0) + 1; p.x += p.speedX; p.y += p.speedY; p.speedY += .035; p.speedX *= .985;
          if ((p.life || 0) > (p.maxLife || 60)) return false;
          ctx.globalAlpha = 1-(p.life || 0)/(p.maxLife || 60);
        } else if (settings.type === 'sparkles') {
          p.life = ((p.life || 0)+speed) % (p.maxLife || 100); ctx.globalAlpha = .15 + Math.abs(Math.sin((p.life || 0)/12))*.85;
        } else {
          p.y += p.speedY; p.x += settings.type === 'rain' ? p.speedX : Math.sin(p.rotation)*p.speedX; p.rotation += p.rotationSpeed;
          if (p.y > canvas.height+20) Object.assign(p, createParticle(canvas.width, canvas.height, settings.type, speed, true));
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
        if (settings.type === 'rain') { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-3,p.y-16); ctx.stroke(); }
        else if (settings.type === 'sparkles') { ctx.beginPath(); ctx.moveTo(p.x-p.radius*3,p.y); ctx.lineTo(p.x+p.radius*3,p.y); ctx.moveTo(p.x,p.y-p.radius*3); ctx.lineTo(p.x,p.y+p.radius*3); ctx.stroke(); }
        else if (settings.type === 'confetti') { ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation); ctx.fillRect(-p.radius,-p.radius*2,p.radius*2,p.radius*4); ctx.restore(); }
        else if (settings.type === 'leaves') { ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation); ctx.beginPath(); ctx.ellipse(0,0,p.radius*2,p.radius,0,0,Math.PI*2); ctx.fill(); ctx.restore(); }
        else { ctx.beginPath(); ctx.arc(p.x,p.y,p.radius,0,Math.PI*2); ctx.fill(); }
        return true;
      });
      ctx.globalAlpha = 1; raf = requestAnimationFrame(animate);
    };
    resize(); reset(); addEventListener('resize', resize); animate();
    return () => { removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, [settings]);
  if (!settings?.enabled) return null;
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50 h-full w-full" />;
};

export default OverlayAnimation;
