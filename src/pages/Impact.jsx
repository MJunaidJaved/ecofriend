import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '../components/impact/AnimatedCounter';
import EcoScoreRing from '../components/impact/EcoScoreRing';
import WorldMap from '../components/impact/WorldMap';
import { useTheme } from '@/lib/ThemeContext';
import { Link } from 'react-router-dom';
import { apiGet } from '../api/base44Client';

export default function Impact() {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiGet('/api/user/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getScoreLabel = (score) => {
    if (score >= 100) return { label: 'Eco Champion', color: '#4ade80' };
    if (score >= 60) return { label: 'Green Warrior', color: '#22d3ee' };
    if (score >= 30) return { label: 'Eco Learner', color: '#f59e0b' };
    return { label: 'Just Starting', color: '#94a3b8' };
  };

  const getCarbonLabel = (score) => {
    if (score <= 30) return { label: 'Low Impact', color: '#4ade80' };
    if (score <= 60) return { label: 'Moderate Impact', color: '#f59e0b' };
    return { label: 'High Impact', color: '#ef4444' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50 font-sans text-lg">Loading your impact...</div>
      </div>
    );
  }

  const scoreInfo = getScoreLabel(stats?.user?.eco_score || 0);

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">Your Impact</h1>
          <p className="text-lg font-sans text-white/50 max-w-xl">
            Everything you have done for the planet, tracked and celebrated.
          </p>
        </motion.div>

        {stats?.user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-start md:items-center gap-6"
            style={{
              backgroundColor: theme.accent + '10',
              border: `1px solid ${theme.accent}25`,
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-serif font-bold text-black flex-shrink-0"
              style={{ backgroundColor: theme.accent }}
            >
              {stats.user.username?.charAt(0).toUpperCase() || 'G'}
            </div>

            <div className="flex-1">
              <h2 className="font-serif text-2xl font-bold text-white mb-1">{stats.user.username}</h2>
              <p className="text-sm font-sans text-white/40 mb-2">Member since {formatDate(stats.user.created_at)}</p>
              <span
                className="inline-block text-xs font-sans font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: scoreInfo.color + '20',
                  color: scoreInfo.color,
                  border: `1px solid ${scoreInfo.color}40`,
                }}
              >
                {scoreInfo.label}
              </span>
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <div className="font-serif text-3xl font-bold" style={{ color: theme.accent }}>{stats.user.eco_score}</div>
                <div className="text-xs font-sans text-white/40 mt-1">Eco Points</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-3xl font-bold" style={{ color: theme.accent }}>{stats.completedChallenges}</div>
                <div className="text-xs font-sans text-white/40 mt-1">Challenges Done</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-3xl font-bold" style={{ color: theme.accent }}>{stats.totalConversations}</div>
                <div className="text-xs font-sans text-white/40 mt-1">Conversations</div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <AnimatedCounter value={128450} label="Eco Questions Asked" />
          <AnimatedCounter value={42} label="Countries Active" />
          <AnimatedCounter value={8700} label="Trees Planted" suffix="+" />
          <AnimatedCounter value={95} label="CO₂ Tons Offset" suffix="K" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col items-center mb-16"
        >
          <h2 className="font-serif text-2xl font-semibold text-white mb-2">Your Eco Score</h2>
          <p className="text-sm font-sans text-white/40 mb-8">Complete challenges to increase your score</p>
          <EcoScoreRing score={stats?.user?.eco_score || 0} />

          {stats && (
            <div className="mt-8 w-full max-w-sm">
              <div className="flex justify-between text-xs font-sans text-white/40 mb-2">
                <span>Challenges completed</span>
                <span style={{ color: theme.accent }}>{stats.completedChallenges} / {stats.totalChallenges}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalChallenges > 0 ? (stats.completedChallenges / stats.totalChallenges) * 100 : 0}%` }}
                  transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: theme.accent }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {stats?.carbonHistory && stats.carbonHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="font-serif text-2xl font-semibold text-white mb-6">Carbon Footprint History</h2>
            <div className="space-y-3">
              {stats.carbonHistory.map((calc, i) => {
                const label = getCarbonLabel(calc.total_score);
                return (
                  <motion.div
                    key={calc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center justify-between rounded-xl px-5 py-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div>
                      <p className="text-sm font-sans text-white font-medium">Carbon Assessment</p>
                      <p className="text-xs font-sans text-white/40 mt-0.5">{formatDate(calc.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-white/40">Transport</div>
                        <div className="text-sm font-sans text-white">{calc.transport_score}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/40">Diet</div>
                        <div className="text-sm font-sans text-white">{calc.diet_score}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/40">Energy</div>
                        <div className="text-sm font-sans text-white">{calc.energy_score}</div>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-sans font-medium"
                        style={{ backgroundColor: label.color + '20', color: label.color, border: `1px solid ${label.color}40` }}
                      >
                        {calc.total_score} pts — {label.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {stats?.carbonHistory && stats.carbonHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-16 rounded-2xl p-8 text-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-white/40 font-sans text-sm mb-4">No carbon calculations yet. Find out your footprint!</p>
            <Link
              to="/calculator"
              className="inline-block px-6 py-2 rounded-full text-sm font-sans font-medium text-black transition-all hover:brightness-110"
              style={{ backgroundColor: theme.accent }}
            >
              Take the Calculator
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="font-serif text-2xl font-semibold text-white mb-6 text-center">Global Eco Activity</h2>
          <WorldMap />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center pb-12"
        >
          <p className="text-sm font-sans text-white/40 mb-4">Every conversation makes a difference.</p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-sans font-medium text-sm text-black hover:brightness-110 transition-all glow-breathe"
            style={{ backgroundColor: theme.accent }}
          >
            Keep Exploring
          </Link>
        </motion.div>

      </div>
    </div>
  );
}