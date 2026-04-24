import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export default function ThinkingIndicator() {
  const { theme } = useTheme();

  const renderIndicator = () => {
    if (theme.id === 'ocean') {
      // Bubbles rising
      return (
        <div className="flex items-end gap-1.5 h-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.accent + '99' }}
              animate={{ y: [0, -16, 0], opacity: [0.4, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.28, ease: 'easeInOut' }}
            />
          ))}
        </div>
      );
    }

    if (theme.id === 'energy') {
      // Charging bar
      return (
        <div className="w-24 h-2 rounded-none overflow-hidden" style={{ background: theme.accent + '22', border: `1px solid ${theme.accent}44` }}>
          <motion.div
            className="h-full"
            style={{ backgroundColor: theme.accent }}
            animate={{ x: ['-100%', '0%', '100%'] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      );
    }

    if (theme.id === 'wildlife') {
      // Ember dots
      return (
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: ['#1a0a00', theme.accent + '88', theme.accent],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      );
    }

    if (theme.id === 'climate') {
      // Heartbeat line
      return (
        <svg width="60" height="20" viewBox="0 0 60 20">
          <motion.polyline
            points="0,10 10,10 15,3 20,17 25,10 35,10 40,5 45,15 50,10 60,10"
            fill="none"
            stroke={theme.accent}
            strokeWidth="1.5"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      );
    }

    // Default: pulsing dots
    return (
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.accent + '88' }}
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      className="flex gap-3 items-start"
    >
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: theme.accent + '22', border: `1px solid ${theme.accent}33` }}
      >
        <Leaf className="w-4 h-4" style={{ color: theme.accent }} />
      </div>
      <div
        className="px-5 py-4 flex items-center"
        style={{
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(12px)',
          borderLeft: `2px solid ${theme.accent}55`,
          borderRadius: '1rem',
        }}
      >
        {renderIndicator()}
      </div>
    </motion.div>
  );
}