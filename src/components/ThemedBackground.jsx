import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/ThemeContext';

function ParticleCanvas({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    const initParticles = () => {
      const type = theme.particles;
      const count = type === 'sparks' ? 80 : type === 'orbits' ? 90 : 60;
      particles = [];

      if (type === 'pollen') {
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * W(), y: Math.random() * H(),
            size: Math.random() * 1.5 + 0.5,
            speedY: -(Math.random() * 0.25 + 0.08),
            speedX: (Math.random() - 0.5) * 0.15,
            opacity: Math.random() * 0.4 + 0.15,
            pulse: Math.random() * Math.PI * 2,
          });
        }
      } else if (type === 'bubbles') {
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * W(), y: Math.random() * H() + H(),
            size: Math.random() * 3 + 1,
            speedY: -(Math.random() * 0.6 + 0.2),
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.4 + 0.1,
            pulse: Math.random() * Math.PI * 2,
          });
        }
      } else if (type === 'sparks') {
        for (let i = 0; i < count; i++) {
          const angle = (Math.random() * 60 + 30) * (Math.PI / 180);
          const speed = Math.random() * 2 + 1;
          particles.push({
            x: Math.random() * W(), y: Math.random() * H(),
            size: Math.random() * 1.2 + 0.3,
            speedX: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
            speedY: -Math.sin(angle) * speed * 0.5,
            opacity: Math.random() * 0.7 + 0.3,
            life: Math.random() * 60 + 20,
            maxLife: 80,
            pulse: 0,
          });
        }
      } else if (type === 'dust') {
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * W(), y: Math.random() * H(),
            size: Math.random() * 2.5 + 1,
            speedY: (Math.random() - 0.3) * 0.2,
            speedX: (Math.random() * 0.4 + 0.1) * (Math.random() > 0.3 ? 1 : -1),
            opacity: Math.random() * 0.35 + 0.1,
            pulse: Math.random() * Math.PI * 2,
          });
        }
      } else if (type === 'ash') {
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * W(), y: Math.random() * H() - H(),
            size: Math.random() * 3 + 0.8,
            speedY: Math.random() * 0.45 + 0.12,
            speedX: (Math.random() - 0.5) * 0.35,
            opacity: Math.random() * 0.45 + 0.1,
            pulse: Math.random() * Math.PI * 2,
            drift: Math.random() * Math.PI * 2,
          });
        }
      } else if (type === 'flares') {
        for (let i = 0; i < 50; i++) {
          particles.push({
            x: Math.random() * W(), y: Math.random() * H(),
            size: Math.random() * 2.5 + 0.8,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: -(Math.random() * 0.4 + 0.05),
            opacity: Math.random() * 0.5 + 0.2,
            pulse: Math.random() * Math.PI * 2,
            flareSize: Math.random() * 18 + 8, // halo radius
            life: Math.random() * 120 + 40,
            maxLife: 160,
          });
        }
      } else if (type === 'snow') {
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * W(), y: Math.random() * H(),
            size: Math.random() * 2.5 + 0.5,
            speedY: Math.random() * 0.5 + 0.15,
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.2,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            pulse: Math.random() * Math.PI * 2,
          });
        }
      } else if (type === 'orbits') {
        const cx = W() / 2;
        const cy = H() / 2;
        for (let i = 0; i < count; i++) {
          const ring = Math.floor(i / 30);
          const radii = [W() * 0.25, W() * 0.38, W() * 0.52];
          const r = radii[ring] || W() * 0.3;
          const angle = Math.random() * Math.PI * 2;
          particles.push({
            cx, cy, r,
            angle,
            speed: (0.002 + Math.random() * 0.001) * (ring % 2 === 0 ? 1 : -1),
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.45 + 0.15,
            pulse: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, W(), H());
      frame++;

      particles.forEach((p, idx) => {
        const type = theme.particles;
        let px = p.x, py = p.y, alpha = p.opacity;

        if (type === 'pollen') {
          p.y += p.speedY;
          p.x += p.speedX;
          p.pulse += 0.018;
          alpha = p.opacity + Math.sin(p.pulse) * 0.12;
          if (p.y < -10) { p.y = H() + 10; p.x = Math.random() * W(); }
          if (p.x < -10) p.x = W() + 10;
          if (p.x > W() + 10) p.x = -10;
          px = p.x; py = p.y;

        } else if (type === 'bubbles') {
          p.y += p.speedY;
          p.x += Math.sin(frame * 0.01 + p.pulse) * 0.3;
          p.pulse += 0.015;
          alpha = p.opacity + Math.sin(p.pulse) * 0.08;
          if (p.y < -10) { p.y = H() + 10; p.x = Math.random() * W(); }
          px = p.x; py = p.y;

        } else if (type === 'sparks') {
          p.life--;
          if (p.life <= 0) {
            const angle = (Math.random() * 60 + 30) * (Math.PI / 180);
            const speed = Math.random() * 2 + 1;
            p.x = Math.random() * W();
            p.y = Math.random() * H();
            p.speedX = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
            p.speedY = -Math.sin(angle) * speed * 0.5;
            p.life = Math.random() * 60 + 20;
            p.maxLife = 80;
          }
          p.x += p.speedX;
          p.y += p.speedY;
          const lifeFrac = p.life / p.maxLife;
          alpha = p.opacity * lifeFrac;
          px = p.x; py = p.y;
          // Occasional bright pulse
          if (Math.random() < 0.002) alpha = 1;

        } else if (type === 'dust') {
          p.y += p.speedY;
          p.x += p.speedX;
          p.pulse += 0.01;
          alpha = p.opacity + Math.sin(p.pulse) * 0.08;
          if (p.x < -10) p.x = W() + 10;
          if (p.x > W() + 10) p.x = -10;
          if (p.y < -10) { p.y = H() + 10; }
          if (p.y > H() + 10) { p.y = -10; }
          px = p.x; py = p.y;

        } else if (type === 'ash') {
          p.y += p.speedY;
          p.drift += 0.012;
          p.x += p.speedX + Math.sin(p.drift) * 0.4;
          p.pulse += 0.015;
          alpha = p.opacity + Math.sin(p.pulse) * 0.07;
          if (p.y > H() + 10) { p.y = -10; p.x = Math.random() * W(); }
          if (p.x < -10) p.x = W() + 10;
          if (p.x > W() + 10) p.x = -10;
          px = p.x; py = p.y;

        } else if (type === 'flares') {
          p.life--;
          if (p.life <= 0) {
            p.x = Math.random() * W();
            p.y = H() * 0.6 + Math.random() * H() * 0.4;
            p.life = Math.random() * 120 + 40;
            p.maxLife = 160;
            p.opacity = Math.random() * 0.5 + 0.2;
          }
          p.y += p.speedY;
          p.x += p.speedX;
          p.pulse += 0.025;
          const flareFrac = p.life / p.maxLife;
          alpha = p.opacity * flareFrac * (0.7 + Math.sin(p.pulse) * 0.3);
          px = p.x; py = p.y;

          // Draw lens flare: inner bright dot + outer glow halo
          const clampedA = Math.max(0, Math.min(1, alpha));
          const grad = ctx.createRadialGradient(px, py, 0, px, py, p.flareSize);
          grad.addColorStop(0, theme.particleColor + clampedA + ')');
          grad.addColorStop(0.35, theme.particleColor + (clampedA * 0.4) + ')');
          grad.addColorStop(1, theme.particleColor + '0)');
          ctx.beginPath();
          ctx.arc(px, py, p.flareSize, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Cross streak
          ctx.save();
          ctx.globalAlpha = clampedA * 0.6;
          ctx.strokeStyle = theme.particleColor + clampedA + ')';
          ctx.lineWidth = 0.6;
          const streak = p.flareSize * 1.4;
          ctx.beginPath(); ctx.moveTo(px - streak, py); ctx.lineTo(px + streak, py); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px, py - streak); ctx.lineTo(px, py + streak); ctx.stroke();
          ctx.restore();
          return;

        } else if (type === 'snow') {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(frame * 0.005 + p.pulse) * 0.2;
          p.rotation += p.rotSpeed;
          p.pulse += 0.01;
          alpha = p.opacity;
          if (p.y > H() + 10) { p.y = -10; p.x = Math.random() * W(); }
          px = p.x; py = p.y;
          // Draw snowflake
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.strokeStyle = theme.particleColor + '0.8)';
          ctx.lineWidth = 0.5;
          for (let arm = 0; arm < 6; arm++) {
            ctx.save();
            ctx.rotate((arm * Math.PI) / 3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -p.size * 2.5);
            ctx.stroke();
            ctx.restore();
          }
          ctx.restore();
          return;

        } else if (type === 'orbits') {
          p.angle += p.speed;
          p.pulse += 0.02;
          p.x = p.cx + p.r * Math.cos(p.angle);
          p.y = p.cy + p.r * Math.sin(p.angle);
          alpha = p.opacity + Math.sin(p.pulse) * 0.1;
          px = p.x; py = p.y;
        }

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        const clampedAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = theme.particleColor + clampedAlpha + ')';
        ctx.shadowBlur = p.size > 1.5 ? 6 : 3;
        ctx.shadowColor = theme.particleColor + (clampedAlpha * 0.5) + ')';
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
  }, [theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

export default function ThemedBackground() {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={theme.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        >
          <img
            src={theme.photo}
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <motion.div
        key={theme.id + '-overlay'}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ backgroundColor: `${theme.bg}${Math.round(theme.overlay * 255).toString(16).padStart(2, '0')}` }}
      />

      <ParticleCanvas theme={theme} />
    </div>
  );
}