import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/ThemeContext';

const THEME_CARDS = {
  forests: {
    title: 'Forest Ecosystems',
    fact: 'Forests cover 31% of the world\'s land and are home to 80% of terrestrial species.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80',
  },
  ocean: {
    title: 'Ocean Health',
    fact: 'Over 80% of marine pollution comes from land-based activities.',
    image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&q=80',
  },
  energy: {
    title: 'Clean Energy',
    fact: 'Solar energy is now the cheapest form of electricity generation in history.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80',
  },
  wildlife: {
    title: 'Wildlife Protection',
    fact: 'We have lost 69% of wildlife populations since 1970 according to WWF.',
    image: 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?w=600&q=80',
  },
  climate: {
    title: 'Climate Crisis',
    fact: 'The last decade was the hottest on record. Every fraction of a degree matters.',
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&q=80',
  },
  recycling: {
    title: 'Recycling Impact',
    fact: 'Recycling one aluminum can saves enough energy to run a TV for three hours.',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80',
  },
};

const ECO_TIPS = [
  'The average American produces 4.4 lbs of trash per day.',
  'Turning off the tap while brushing saves 8 gallons of water.',
  'One tree absorbs about 48 lbs of CO₂ per year.',
  'LED bulbs use 75% less energy than incandescent.',
  'Food waste accounts for 8% of global emissions.',
  'Reusable bags save 1,500 plastic bags per year per person.',
  'Carpooling just twice a week cuts commuting emissions by 40%.',
];

const todayTip = ECO_TIPS[new Date().getDate() % ECO_TIPS.length];

export default function ContextPanel({ contextCard }) {
  const { theme } = useTheme();
  const activeCard = THEME_CARDS[theme.id] || contextCard;

  return (
    <div
      className="w-64 shrink-0 h-full border-l border-white/10 flex flex-col overflow-y-auto"
      style={{ backgroundColor: theme.bg + 'cc', backdropFilter: 'blur(16px)' }}
    >
      {/* Daily Tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-5 border-b border-white/10"
      >
        <p className="text-xs font-sans font-medium text-white/40 uppercase tracking-wider mb-3">
          Today's Eco Tip
        </p>
        <p className="text-sm font-sans text-white/75 leading-relaxed">{todayTip}</p>
      </motion.div>

      {/* CO2 Widget */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-5 border-b border-white/10"
      >
        <p className="text-xs font-sans font-medium text-white/40 uppercase tracking-wider mb-4">
          Global CO₂ Today
        </p>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={theme.accent}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * 0.22 }}
                transition={{ duration: 2, delay: 0.6, ease: 'easeOut' }}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-lg font-bold text-white">421</span>
              <span className="text-xs text-white/40 font-sans">ppm</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-center font-sans mt-3" style={{ color: theme.accent }}>
          78% above pre-industrial
        </p>
      </motion.div>

      {/* Context Card */}
      <AnimatePresence>
        {activeCard && (
          <motion.div
            key={activeCard.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="p-5"
          >
            <p className="text-xs font-sans font-medium text-white/40 uppercase tracking-wider mb-3">
              Related Context
            </p>
            {activeCard.image && (
              <img
                src={activeCard.image}
                alt={activeCard.title}
                className="w-full h-32 object-cover rounded-xl mb-3"
              />
            )}
            <h4 className="font-serif text-base font-semibold text-white mb-2">{activeCard.title}</h4>
            <p className="text-xs font-sans text-white/60 leading-relaxed">{activeCard.fact}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}