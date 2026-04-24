import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function EcoScoreRing({ score = 72 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-44">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="hsl(144, 15%, 14%)"
            strokeWidth="10"
          />
          <motion.circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="hsl(142, 71%, 45%)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: offset } : {}}
            transition={{ duration: 2.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="text-4xl font-serif font-bold text-foreground"
          >
            {score}
          </motion.span>
          <span className="text-xs font-sans text-muted-foreground">Eco Score</span>
        </div>
      </div>
      <p className="text-sm font-sans text-muted-foreground text-center max-w-xs">
        Your environmental impact score based on community engagement
      </p>
    </div>
  );
}