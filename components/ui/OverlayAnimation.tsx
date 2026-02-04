
import React, { useEffect, useRef, useMemo } from 'react';
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

    // Performance Optimization: Render the heart emoji once to an offscreen canvas
    // instead of calling fillText (which is expensive) on every frame for every particle.
    const heartBuffer = useMemo(() => {
        if (settings?.type !== 'broken-hearts') return null;
        
        const canvas = document.createElement('canvas');
        const size = 64; // Use a fixed decent resolution
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.font = `${size * 0.8}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Slight Y adjustment to center the emoji vertically
            ctx.fillText('💔', size / 2, size / 2 + (size * 0.1));
        }
        return canvas;
    }, [settings?.type]);

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
            initParticles();
        };
        window.addEventListener('resize', resize);
        
        // Set initial size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Initialize particles
        const initParticles = () => {
            const isMobile = window.innerWidth < 768;
            // Reduce count slightly for performance while maintaining density feel
            const count = isMobile ? 15 : 30; 
            particles.current = [];
            for (let i = 0; i < count; i++) {
                particles.current.push(createParticle(canvas.width, canvas.height, settings.type));
            }
        };
        initParticles();

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const isBrokenHearts = settings.type === 'broken-hearts' && heartBuffer;

            particles.current.forEach((p, i) => {
                // Update Physics
                p.y += p.speedY;
                p.x += Math.sin(p.rotation) * p.speedX; 
                p.rotation += p.rotationSpeed;

                // Reset if out of bounds (bottom)
                // Use a larger buffer (100) to ensure they clear screen before respawning
                if (p.y > canvas.height + 100) { 
                    particles.current[i] = createParticle(canvas.width, canvas.height, settings.type, true);
                }

                // Drawing
                // Use setTransform instead of save/restore for better performance in the loop
                if (isBrokenHearts) {
                    const size = p.radius * 2;
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.drawImage(heartBuffer!, -p.radius, -p.radius, size, size);
                    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset identity
                } else {
                    // Fallback for shapes
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    
                    // Snow doesn't need rotation, optimization
                    if (settings.type !== 'snow') {
                        ctx.rotate(p.rotation);
                    }

                    ctx.fillStyle = p.color;
                    ctx.beginPath();

                    if (settings.type === 'confetti') {
                        ctx.fillRect(-p.radius, -p.radius * 2, p.radius * 2, p.radius * 4);
                    } else if (settings.type === 'leaves') {
                        ctx.ellipse(0, 0, p.radius * 2, p.radius, 0, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Snow
                        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                }
            });

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [settings, heartBuffer]);

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
    const y = top ? -100 : Math.random() * h; // Start higher up (-100) to ensure smooth entry
    
    if (type === 'snow') {
        return {
            x, y,
            radius: Math.random() * 2 + 1,
            color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`,
            speedY: Math.random() * 1 + 0.5,
            speedX: Math.random() * 0.5,
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
    } else if (type === 'broken-hearts') {
        return {
            x, y,
            // 25% smaller than original roughly 20-50 range. Now roughly 11-26 radius.
            radius: (Math.random() * 15 + 10) * 0.75, 
            color: '#000000', 
            // Slower fall speed: 1.5 to 3.0 pixels per frame (Reduced from 2.5-4.5)
            speedY: Math.random() * 1.5 + 1.5, 
            // Reduced sway for smoother look
            speedX: Math.random() * 0.5 - 0.25,
            rotation: Math.random() * Math.PI * 2,
            // Slower, consistent rotation
            rotationSpeed: Math.random() * 0.02 - 0.01 
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
