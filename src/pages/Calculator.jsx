import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Bike, PersonStanding, Train, Home, Building2, Leaf, Zap, Beef, Salad, ShoppingBag, Recycle } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { apiPost } from '../api/base44Client';

const questions = [
  {
    id: 'commute',
    question: 'How do you mainly get around?',
    options: [
      { label: 'Car', icon: Car, value: 40 },
      { label: 'Public Transport', icon: Train, value: 15 },
      { label: 'Bicycle', icon: Bike, value: 2 },
      { label: 'Walking', icon: PersonStanding, value: 0 },
    ],
  },
  {
    id: 'home',
    question: 'What type of home do you live in?',
    options: [
      { label: 'Large House', icon: Home, value: 35 },
      { label: 'Apartment', icon: Building2, value: 15 },
      { label: 'Small House', icon: Home, value: 22 },
      { label: 'Eco Home', icon: Leaf, value: 5 },
    ],
  },
  {
    id: 'energy',
    question: 'What powers your home?',
    options: [
      { label: 'Grid Electricity', icon: Zap, value: 30 },
      { label: 'Renewables', icon: Leaf, value: 5 },
      { label: 'Mixed', icon: Zap, value: 18 },
      { label: 'Not Sure', icon: Building2, value: 22 },
    ],
  },
  {
    id: 'diet',
    question: 'What best describes your diet?',
    options: [
      { label: 'Meat Heavy', icon: Beef, value: 45 },
      { label: 'Mixed Diet', icon: Salad, value: 25 },
      { label: 'Vegetarian', icon: Salad, value: 12 },
      { label: 'Vegan', icon: Leaf, value: 5 },
    ],
  },
  {
    id: 'shopping',
    question: 'How do you approach consumption?',
    options: [
      { label: 'Buy New Often', icon: ShoppingBag, value: 30 },
      { label: 'Buy Occasionally', icon: ShoppingBag, value: 15 },
      { label: 'Second-hand', icon: Recycle, value: 5 },
      { label: 'Minimal Buyer', icon: Leaf, value: 2 },
    ],
  },
];

const suggestions = [
  { icon: '🚲', text: 'Switch one weekly car trip to cycling', impact: 'Save ~2kg CO₂ weekly' },
  { icon: '🥗', text: 'Try one meat-free day per week', impact: 'Save ~0.5kg CO₂ daily' },
  { icon: '💡', text: 'Switch to LED bulbs throughout your home', impact: 'Save ~200kg CO₂ yearly' },
];

export default function Calculator() {
  const { theme } = useTheme();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);

  // Authentication protection - redirect if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
    }
  }, []);

  const score = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = questions.reduce((a, q) => a + Math.max(...q.options.map(o => o.value)), 0);
  const pct = Math.round((score / maxScore) * 100);
  const dialColor = pct > 66 ? '#ef4444' : pct > 33 ? '#f59e0b' : '#22c55e';

  const handleSelect = (value) => {
    const q = questions[current];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        setDone(true);
      }
    }, 350);
  };

  // Save results when done
  useEffect(() => {
    if (done && !saved) {
      const saveCalculation = async () => {
        try {
          await apiPost('/api/carbon', {
            transport_score: answers.commute || 0,
            diet_score: answers.diet || 0,
            energy_score: (answers.energy || 0) + (answers.home || 0) + (answers.shopping || 0)
          });
          setSaved(true);
        } catch (error) {
          console.error('Failed to save calculation:', error);
        }
      };
      saveCalculation();
    }
  }, [done, saved, answers]);

  const slideVariants = {
    enter: { x: '100%', opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      <div className="relative z-10 w-full max-w-2xl">
        {!done ? (
          <>
            {/* Progress bar */}
            <div className="mb-8 flex gap-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-500"
                  style={{ backgroundColor: i <= current ? theme.accent : 'rgba(255,255,255,0.15)' }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-10 text-center">
                  {questions[current].question}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {questions[current].options.map((opt) => (
                    <motion.button
                      key={opt.label}
                      onClick={() => handleSelect(opt.value)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border transition-all duration-200 cursor-pointer"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        backdropFilter: 'blur(16px)',
                        borderColor: 'rgba(255,255,255,0.12)',
                      }}
                      onHoverStart={(e) => {
                        e.target.style && (e.target.style.borderColor = theme.accent + '66');
                      }}
                    >
                      <opt.icon className="w-10 h-10" style={{ color: theme.accent }} />
                      <span className="text-white/85 font-sans font-medium text-base">{opt.label}</span>
                    </motion.button>
                  ))}
                </div>

                <p className="text-center text-white/30 font-sans text-sm mt-8">
                  Question {current + 1} of {questions.length}
                </p>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center"
          >
            <h2 className="font-serif text-3xl font-bold text-white mb-3">Your Carbon Footprint</h2>
            <p className="text-white/50 font-sans mb-10">Based on your lifestyle choices</p>

            {/* Score dial */}
            <div className="relative inline-flex items-center justify-center mb-10">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                <motion.circle
                  cx="100" cy="100" r="80"
                  fill="none"
                  stroke={dialColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - pct / 100) }}
                  transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <motion.span
                  className="font-serif text-5xl font-bold"
                  style={{ color: dialColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {pct}
                </motion.span>
                <span className="text-white/50 font-sans text-sm">/ 100</span>
              </div>
            </div>

            <p className="text-white/60 font-sans mb-8">
              {pct > 66 ? 'Your footprint is high. Small changes add up fast.' :
               pct > 33 ? 'You\'re doing okay — room to improve!' :
               'Excellent! You\'re living lightly on the planet.'}
            </p>

            {/* Suggestions */}
            <div className="space-y-3 text-left">
              {suggestions.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + i * 0.2 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/10"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="text-white/85 font-sans text-sm font-medium">{s.text}</p>
                    <p className="font-sans text-xs mt-0.5" style={{ color: theme.accent }}>{s.impact}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
              onClick={() => { setDone(false); setCurrent(0); setAnswers({}); }}
              className="mt-8 px-8 py-3 rounded-full font-sans font-medium text-black transition-all hover:brightness-110"
              style={{ backgroundColor: theme.accent }}
            >
              Recalculate
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}