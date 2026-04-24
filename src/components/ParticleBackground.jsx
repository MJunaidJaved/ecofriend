import { useEffect, useRef } from 'react';

const NATURE_IMAGES = [
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
];

export default function ParticleBackground({ imageIndex = 0, overlay = 0.85 }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const count = 60;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.3 + 0.1),
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += 0.02;
        const glow = p.opacity + Math.sin(p.pulse) * 0.15;

        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(142, 71%, 55%, ${glow})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(142, 71%, 55%, ${glow * 0.5})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const idx = imageIndex % NATURE_IMAGES.length;

  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 transition-opacity duration-[3000ms]">
        <img
          src={NATURE_IMAGES[idx]}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(5, 15, 8, ${overlay})` }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}