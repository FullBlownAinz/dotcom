import React, { useEffect, useRef } from 'react';
import { SiteSettings } from '../../types/index.ts';

interface OverlayAnimationProps {
    settings?: SiteSettings['overlay_animation'];
}

interface Particle {
    x: number;
    y: number;
    radius: number;
    color: string;
    speedX: number;
    speedY: number;
    rotation: number;
    rotationSpeed: number;
}

const OverlayAnimation: React.FC<OverlayAnimationProps> = ({ settings }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    const particles = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !settings?.enabled) {
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize handler
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Initialize particles
        const initParticles = () => {
            const count = window.innerWidth < 768 ? 30 : 60; // Fewer particles on mobile
            particles.current = [];
            for (let i = 0; i < count; i++) {
                particles.current.push(createParticle(canvas.width, canvas.height, settings.type));
            }
        };
        initParticles();

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.current.forEach((p, i) => {
                // Update
                p.y += p.speedY;
                p.x += Math.sin(p.rotation) * p.speedX; // Sway logic
                p.rotation += p.rotationSpeed;

                // Reset if out of bounds
                if (p.y > canvas.height) {
                    particles.current[i] = createParticle(canvas.width, canvas.height, settings.type, true);
                }

                // Draw
                ctx.beginPath();
                ctx.fillStyle = p.color;

                if (settings.type === 'confetti') {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.fillRect(-p.radius, -p.radius * 2, p.radius * 2, p.radius * 4);
                    ctx.restore();
                } else if (settings.type === 'leaves') {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.ellipse(0, 0, p.radius * 2, p.radius, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else {
                    // Snow
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [settings]);

    if (!settings?.enabled) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50 w-full h-full"
        />
    );
};

const createParticle = (w: number, h: number, type: string, top: boolean = false): Particle => {
    const x = Math.random() * w;
    const y = top ? -20 : Math.random() * h;
    
    if (type === 'snow') {
        return {
            x, y,
            radius: Math.random() * 2 + 1,
            color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`,
            speedY: Math.random() * 1 + 0.5,
            speedX: Math.random() * 0.5, // sway
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: Math.random() * 0.02
        };
    } else if (type === 'leaves') {
        const colors = ['#e9c46a', '#f4a261', '#e76f51', '#2a9d8f'];
        return {
            x, y,
            radius: Math.random() * 3 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 1.5 + 1,
            speedX: Math.random() * 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: Math.random() * 0.05 - 0.025
        };
    } else { // confetti
        const colors = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c', '#ffffff'];
        return {
            x, y,
            radius: Math.random() * 2 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: Math.random() * 0.1
        };
    }
};

export default OverlayAnimation;