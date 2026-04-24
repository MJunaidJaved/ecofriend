import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/ThemeContext';
const navLinks = [
  { label: 'Chat', path: '/chat' },
  { label: 'Learn', path: '/learn' },
  { label: 'Calculator', path: '/calculator' },
  { label: 'Challenges', path: '/challenges' },
  { label: 'Impact', path: '/impact' },
];

export default function TopNav() {
  const location = useLocation();
  const { theme } = useTheme();
  const [hoveredLink, setHoveredLink] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 border-b"
      style={{
        backgroundColor: theme.bg + 'cc',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <Link to="/" className="flex items-center gap-2 group">
        <Leaf className="w-5 h-5 transition-transform group-hover:rotate-12" style={{ color: theme.accent }} />
        <span className="font-serif text-lg font-semibold text-white/90 tracking-wide">
          EcoFriend
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {navLinks.map((link) => {
          const active = location.pathname === link.path;
          const isHovered = hoveredLink === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onMouseEnter={() => setHoveredLink(link.path)}
              onMouseLeave={() => setHoveredLink(null)}
              className="relative text-sm font-sans font-medium transition-colors pb-1"
              style={{ color: active ? theme.accent : 'rgba(255,255,255,0.65)' }}
            >
              {link.label}
              {/* Hover sweep underline */}
              {isHovered && !active && (
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] rounded-full"
                  style={{ backgroundColor: theme.accent + '88' }}
                />
              )}
              {/* Active underline */}
              {active && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full"
                  style={{ backgroundColor: theme.accent }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="relative">
  <div
    onClick={() => setDropdownOpen(!dropdownOpen)}
    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
    style={{ backgroundColor: theme.accent + '22', border: `1px solid ${theme.accent}33` }}
  >
    <User className="w-4 h-4" style={{ color: theme.accent + 'cc' }} />
  </div>

  {dropdownOpen && (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-10 w-40 rounded-xl overflow-hidden shadow-xl"
      style={{
        backgroundColor: theme.bg,
        border: `1px solid ${theme.accent}33`,
      }}
    >
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:brightness-125"
        style={{ color: theme.accent }}
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </motion.div>
  )}
</div>
    </motion.nav>
  );
}