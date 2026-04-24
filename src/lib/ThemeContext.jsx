import { createContext, useContext, useState, useCallback } from 'react';

export const THEMES = {
  forests: {
    id: 'forests',
    label: 'Forests',
    photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    overlay: 0.82,
    accent: '#4ade80',
    accentHsl: '142 71% 45%',
    bg: '#050f08',
    particles: 'pollen',
    particleColor: 'hsla(90, 60%, 65%,',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean Health',
    photo: 'https://images.unsplash.com/photo-1494564605686-2e931f77a8e2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    overlay: 0.68,
    accent: '#22d3ee',
    accentHsl: '189 94% 43%',
    bg: '#020d1a',
    particles: 'bubbles',
    particleColor: 'hsla(195, 80%, 85%,',
  },
  energy: {
    id: 'energy',
    label: 'Energy',
    photo: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80',
    overlay: 0.88,
    accent: '#eab308',
    accentHsl: '45 93% 47%',
    bg: '#0f0e00',
    particles: 'sparks',
    particleColor: 'hsla(55, 95%, 75%,',
  },
  wildlife: {
    id: 'wildlife',
    label: 'Wildlife',
    photo: 'https://images.unsplash.com/photo-1545063914-a1a6ec821c88?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    overlay: 0.72,
    accent: '#d4a98a',
    accentHsl: '25 95% 53%',
    bg: '#0f0500',
    particles: 'flares',
    particleColor: 'hsla(25, 95%, 65%,',
  },
  climate: {
    id: 'climate',
    label: 'Climate',
    photo: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1920&q=80',
    overlay: 0.85,
    accent: '#60a5fa',
    accentHsl: '213 94% 68%',
    bg: '#050d1a',
    particles: 'snow',
    particleColor: 'hsla(210, 80%, 95%,',
  },
  recycling: {
    id: 'recycling',
    label: 'Recycling',
    photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',
    overlay: 0.85,
    accent: '#84cc16',
    accentHsl: '84 81% 44%',
    bg: '#0d1a00',
    particles: 'orbits',
    particleColor: 'hsla(84, 70%, 55%,',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(THEMES.forests);
  const [transitioning, setTransitioning] = useState(false);

  const setTheme = useCallback((themeId) => {
    if (themeId === theme.id) return;
    setTransitioning(true);
    setTimeout(() => {
      setThemeState(THEMES[themeId] || THEMES.forests);
      setTransitioning(false);
    }, 300);
  }, [theme.id]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, transitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}