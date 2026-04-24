import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, User, Lock, Mail, LogIn, UserPlus } from 'lucide-react';
import ThemedBackground from '../components/ThemedBackground';
import { ThemeProvider } from '@/lib/ThemeContext';
import { apiPost } from '../api/base44Client';

const tagline = 'Ask anything. Live greener.';

function LandingContent() {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/chat');
      return;
    }

    const timer = setTimeout(() => {
      let i = 0;
      const typing = setInterval(() => {
        setTypedText(tagline.slice(0, i + 1));
        i++;
        if (i >= tagline.length) {
          clearInterval(typing);
          setTimeout(() => setShowButton(true), 400);
        }
      }, 55);
      return () => clearInterval(typing);
    }, 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setToast(null), 400);
    }, 3000);
  };

  const handleEnter = () => {
    setShowAuth(true);
  };

  const handleGuestAccess = () => {
    localStorage.setItem('token', 'guest');
    localStorage.setItem('user', JSON.stringify({
      id: 'guest',
      username: 'Guest',
      email: '',
      eco_score: 0,
      isGuest: true,
    }));
    setLeaving(true);
    setTimeout(() => navigate('/chat'), 700);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN FLOW — verify credentials then enter chat
        const data = await apiPost('/api/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast(`Welcome back, ${data.user.username}! 🌿`);
        setTimeout(() => {
          setLeaving(true);
          setTimeout(() => navigate('/chat'), 700);
        }, 1500);
      } else {
        // REGISTER FLOW — save to db, show success, switch to login form
        await apiPost('/api/auth/register', { username, email, password });
        showToast('Account created successfully! Please sign in. 🌱', 'success');
        // Clear fields
        setUsername('');
        setPassword('');
        // Switch to login form after a short delay
        setTimeout(() => {
          setIsLogin(true);
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {!leaving ? (
        <motion.div
          key="landing"
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          <ThemedBackground />

          <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <Leaf className="w-10 h-10 text-primary" />
              <h1 className="font-serif text-6xl md:text-7xl font-bold text-white tracking-tight">
                EcoFriend
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-xl md:text-2xl font-sans font-light text-white/75 h-8"
            >
              {typedText}
              <span className="cursor-blink text-primary">|</span>
            </motion.p>

            <AnimatePresence>
              {showButton && !showAuth && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55 }}
                  className="relative mt-4"
                >
                  {/* Progress ring */}
                  <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)]" style={{ top: '-12px', left: '-12px' }}>
                    <motion.rect
                      x="1" y="1"
                      width="calc(100% - 2)" height="calc(100% - 2)"
                      rx="50"
                      fill="none"
                      stroke="rgba(74,222,128,0.5)"
                      strokeWidth="1.5"
                      strokeDasharray="300"
                      strokeDashoffset="300"
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
                    />
                  </svg>
                  <div className="flex flex-col items-center gap-4">
  <button
    onClick={handleEnter}
    className="relative glow-breathe px-10 py-4 rounded-full bg-primary text-primary-foreground font-sans font-semibold text-lg tracking-wide transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95"
  >
    Start Talking
  </button>

  
</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <AnimatePresence>
              {showAuth && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 w-full max-w-sm"
                >
                  <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                        <input
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-green-400/50"
                          required={!isLogin}
                        />
                      </div>
                    )}
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-green-400/50"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-green-400/50"
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-green-500 text-black font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        'Loading...'
                      ) : isLogin ? (
                        <><LogIn className="w-5 h-5" /> Sign In</>
                      ) : (
                        <><UserPlus className="w-5 h-5" /> Sign Up</>
                      )}
                    </button>

                    <p className="text-center text-white/60 text-sm">
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-green-400 hover:underline"
                      >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>

                    <div className="relative flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs text-white/30 font-sans">or</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGuestAccess}
                      className="w-full py-3 rounded-xl font-sans text-sm font-medium transition-all hover:brightness-125"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.6)',
                      }}
                    >
                      Continue as Guest
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: toastVisible ? 1 : 0, y: toastVisible ? 0 : 30, scale: toastVisible ? 1 : 0.95 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] justify-center"
                  style={{
                    backgroundColor: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(0,0,0,0.6)',
                    border: toast.type === 'error' ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(74,222,128,0.3)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <span className="text-lg">
                    {toast.type === 'error' ? '❌' : '✅'}
                  </span>
                  <p className="text-sm font-sans font-medium text-white">
                    {toast.message}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 3, duration: 1 }}
              className="text-sm font-sans text-white mt-8"
            >
              Powered by AI · Built for the planet
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function Landing() {
  return (
    <ThemeProvider>
      <LandingContent />
    </ThemeProvider>
  );
}