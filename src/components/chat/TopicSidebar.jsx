import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Zap, TreePine, Bug, Recycle, Globe } from 'lucide-react';
import { useTheme, THEMES } from '@/lib/ThemeContext';

const topics = [
  { label: 'Forests', icon: TreePine, themeId: 'forests' },
  { label: 'Ocean Health', icon: Waves, themeId: 'ocean' },
  { label: 'Energy', icon: Zap, themeId: 'energy' },
  { label: 'Wildlife', icon: Bug, themeId: 'wildlife' },
  { label: 'Climate', icon: Globe, themeId: 'climate' },
  { label: 'Recycling', icon: Recycle, themeId: 'recycling' },
];

function LeafIcon() {
  return (
    <motion.svg
      width="12" height="12" viewBox="0 0 12 12"
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ display: 'inline-block' }}
    >
      <path
        d="M2 10 C2 10, 8 9, 10 2 C7 2, 2 5, 2 10Z"
        fill="currentColor"
        opacity="0.9"
      />
    </motion.svg>
  );
}

export default function TopicSidebar({ onSelectTopic, impactCount }) {
  const { theme, setTheme } = useTheme();
  const [hoveredTopic, setHoveredTopic] = useState(null);

  return (
    <div
      className="w-56 shrink-0 h-full flex flex-col border-r border-white/10"
      style={{ backgroundColor: theme.bg + 'cc', backdropFilter: 'blur(16px)' }}
    >
      

      {/* Topics */}
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-sans font-medium text-white/40 uppercase tracking-wider mb-3">
          Worlds
        </p>
        {topics.map((topic, i) => {
          const isActive = theme.id === topic.themeId;
          const themeData = THEMES[topic.themeId];
          return (
            <motion.button
              key={topic.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              onHoverStart={() => setHoveredTopic(topic.themeId)}
              onHoverEnd={() => setHoveredTopic(null)}
              whileHover={{ x: 6 }}
              onClick={() => {
                setTheme(topic.themeId);
                onSelectTopic(topic.themeId);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors relative"
              style={{
                backgroundColor: isActive ? theme.accent + '22' : 'transparent',
                color: isActive ? theme.accent : 'rgba(255,255,255,0.7)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                style={{ backgroundColor: themeData.accent }}
              />
              <topic.icon className="w-4 h-4 flex-shrink-0 opacity-70" />
              <span className="flex-1 text-left">{topic.label}</span>
              <AnimatePresence>
                {hoveredTopic === topic.themeId && (
                  <span style={{ color: themeData.accent }}>
                    <LeafIcon />
                  </span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Impact Counter */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs font-sans text-white/40 uppercase tracking-wider mb-2">
          Community Impact
        </p>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={impactCount}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-serif font-bold"
            style={{ color: theme.accent }}
          >
            {impactCount.toLocaleString()}
          </motion.span>
          <span className="text-xs text-white/40">questions today</span>
        </div>
      </div>
    </div>
  );
}