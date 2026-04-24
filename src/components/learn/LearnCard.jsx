import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export default function LearnCard({ title, description, image, delay = 0 }) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay, duration: 0.55, ease: 'easeOut' }}
        onClick={() => setExpanded(true)}
        className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 aspect-[4/3]"
        whileHover={{ y: -6, boxShadow: `0 20px 60px -10px ${theme.accent}44` }}
      >
        {/* Full-bleed image */}
        <div className="absolute inset-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          />
          {/* Gradient over bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          {/* Hover tint */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
            style={{ backgroundColor: theme.accent }}
          />
        </div>

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-0 group-hover:-translate-y-1 transition-transform duration-400">
          <h3 className="font-serif text-lg font-semibold text-white mb-1 leading-tight">
            {title}
          </h3>
          <p
            className="text-xs font-sans text-white/60 leading-relaxed mb-2 max-h-0 group-hover:max-h-12 overflow-hidden transition-all duration-400"
          >
            {description}
          </p>
          <span
            className="text-xs font-sans font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ color: theme.accent }}
          >
            Read More →
          </span>
        </div>
      </motion.div>

      {/* Expanded Article View */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden border border-white/15"
              style={{ backgroundColor: '#0a1a0c' }}
            >
              <img src={image} alt={title} className="w-full h-64 object-cover" />
              <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 to-transparent" />
              <button
                onClick={() => setExpanded(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="p-8">
                <h2 className="font-serif text-3xl font-bold text-white mb-3">{title}</h2>
                <p className="font-sans text-white/70 text-base leading-relaxed">{description}</p>
                <p className="font-sans text-white/50 text-sm mt-4 leading-relaxed">
                  This topic is one of the most critical areas of environmental science today. Understanding the interplay between human activity and natural systems is key to building a sustainable future. Our AI assistant can help you explore deeper questions — just head to the Chat page and ask anything.
                </p>
                <button
                  onClick={() => setExpanded(false)}
                  className="mt-6 px-6 py-2.5 rounded-full text-sm font-sans font-medium text-black transition-all hover:brightness-110"
                  style={{ backgroundColor: theme.accent }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}