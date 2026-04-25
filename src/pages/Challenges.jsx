import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { apiGet, apiPost } from '../api/base44Client';

const difficultyColor = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };

const challengeImages = {
  1: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80',
  2: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80',
  3: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&q=80',
  4: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
  5: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
  6: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80',
  7: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  8: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
  9: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80',
  10: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80',
};

function CheckCircle({ checked, accent }) {
  return (
    <div
      className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300"
      style={{
        borderColor: checked ? accent : 'rgba(255,255,255,0.3)',
        backgroundColor: checked ? accent : 'transparent',
      }}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Check className="w-4 h-4 text-black" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Challenges() {
  const { theme } = useTheme();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ecoScore, setEcoScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Authentication protection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const data = await apiGet('/api/challenges');
      const challengesWithImages = data.challenges.map(c => ({
        ...c,
        image: challengeImages[c.id] || challengeImages[1]
      }));
      setChallenges(challengesWithImages);
      if (typeof data.streak === 'number') setStreak(data.streak);

      const userData = await apiGet('/api/auth/me');
      setEcoScore(userData.user.eco_score);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id) => {
    const challenge = challenges.find(c => c.id === id);
    if (challenge?.completed) return;

    try {
      const data = await apiPost(`/api/challenges/${id}/complete`, {});
      setEcoScore(data.eco_score);
      if (typeof data.streak === 'number') setStreak(data.streak);

      setChallenges((prev) =>
        prev.map((c) => c.id === id ? { ...c, completed: true } : c)
          .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
      );
    } catch (error) {
      console.error('Failed to complete challenge:', error);
    }
  };

  const completed = challenges.filter((c) => c.completed).length;
  const pct = challenges.length > 0 ? (completed / challenges.length) * 100 : 0;
  const circumference = 2 * Math.PI * 28;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50 font-sans text-lg">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">
              Eco Challenges
            </h1>
            <p className="font-sans text-white/50">
              Complete challenges each day. Checkmarks clear on a new day so you can earn points again and grow your streak.
            </p>
            <p className="font-sans text-sm mt-1" style={{ color: theme.accent }}>
              Eco Score: {ecoScore} pts
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Streak */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Flame className="w-7 h-7" style={{ color: '#f97316' }} />
              </motion.div>
              <div>
                <div className="font-serif text-2xl font-bold text-white">{streak}</div>
                <div className="text-xs text-white/40 font-sans">day streak</div>
              </div>
            </div>

            {/* Progress ring */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <motion.circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-sm font-bold text-white">
                  {completed}/{challenges.length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {challenges.map((challenge, i) => (
              <motion.div
                key={challenge.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: challenge.completed ? 0.5 : 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative rounded-2xl overflow-hidden cursor-pointer aspect-square border border-white/10"
                onClick={() => toggle(challenge.id)}
                whileHover={{ scale: 1.03 }}
              >
                <img
                  src={challenge.image}
                  alt={challenge.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Difficulty dot */}
                <div
                  className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: difficultyColor[challenge.difficulty] }}
                />

                {/* Check */}
                <div className="absolute top-3 right-3">
                  <CheckCircle checked={challenge.completed} accent={theme.accent} />
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-sans text-sm font-medium text-white leading-tight">
                    {challenge.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: difficultyColor[challenge.difficulty] }}>
                    {challenge.difficulty} · {challenge.points} pts
                  </p>
                </div>

                {/* Completed overlay */}
                <AnimatePresence>
                  {challenge.completed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: theme.accent + '22' }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <Check className="w-6 h-6 text-black" strokeWidth={3} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}