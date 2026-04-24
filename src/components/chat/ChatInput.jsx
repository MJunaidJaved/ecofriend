import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export const TOPIC_CHIPS = {
  forests: [
    'Why are rainforests called the lungs of the Earth?',
    'How does deforestation affect climate change?',
    'What trees absorb the most carbon?',
    'How can I help reforestation efforts?',
  ],
  ocean: [
    'How does plastic harm marine life?',
    'What is ocean acidification?',
    'How are coral reefs dying?',
    'What is the Great Pacific Garbage Patch?',
  ],
  energy: [
    'How does solar power work?',
    'What is the cleanest energy source?',
    'How can I reduce home energy use?',
    'What is a carbon-neutral grid?',
  ],
  wildlife: [
    'Which species are most at risk right now?',
    'How does habitat loss threaten biodiversity?',
    'What does rewilding mean?',
    'How do wildfires affect ecosystems?',
  ],
  climate: [
    'What is the 1.5°C climate target?',
    'How does the greenhouse effect work?',
    'What are climate tipping points?',
    'How does permafrost thawing accelerate warming?',
  ],
  recycling: [
    'What items are most commonly mis-recycled?',
    'How does recycling reduce CO₂ emissions?',
    'What is the circular economy?',
    'Can plastic actually be recycled?',
  ],
};

const DEFAULT_CHIPS = [
  'How do I reduce my carbon footprint?',
  'What is carbon offsetting?',
  'Tips for sustainable living',
  'How does ocean pollution affect wildlife?',
];

export default function ChatInput({ onSend, disabled, activeThemeId }) {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const chips = TOPIC_CHIPS[activeThemeId] || DEFAULT_CHIPS;

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleChip = (chip) => {
    if (disabled) return;
    onSend(chip);
  };

  return (
    <div className="p-4">
      {/* Quick chips */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
        <AnimatePresence mode="wait">
          {chips.map((chip, i) => (
            <motion.button
              key={activeThemeId + chip}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => handleChip(chip)}
              disabled={disabled}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-sans transition-all duration-200 disabled:opacity-30 whitespace-nowrap"
              style={{
                backgroundColor: `${theme.accent}18`,
                border: `1px solid ${theme.accent}33`,
                color: 'rgba(255,255,255,0.75)',
              }}
              whileHover={{ scale: 1.04, backgroundColor: theme.accent + '28' }}
            >
              {chip}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 transition-all duration-400"
        style={{
          background: focused ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${focused ? theme.accent + '66' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '1rem',
          boxShadow: focused ? `0 0 20px 2px ${theme.accent}18` : 'none',
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask about the planet..."
          disabled={disabled}
          className="flex-1 bg-transparent text-sm font-sans text-white/90 placeholder:text-white/30 focus:outline-none disabled:opacity-50"
        />
        <motion.button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: text.trim() ? theme.accent + '33' : 'transparent' }}
        >
          <Send className="w-4 h-4" style={{ color: theme.accent }} />
        </motion.button>
      </div>
    </div>
  );
}