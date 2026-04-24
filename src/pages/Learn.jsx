import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LearnCard from '../components/learn/LearnCard';
import { useTheme } from '@/lib/ThemeContext';

const topics = [
  {
    title: 'The Carbon Cycle',
    description: 'Understanding how carbon moves through Earth\u2019s systems and why balance matters.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  },
  {
    title: 'Ocean Ecosystems',
    description: 'Dive into coral reefs, deep sea vents, and the creatures that call the ocean home.',
    image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&q=80',
  },
  {
    title: 'Solar Revolution',
    description: 'How solar technology is reshaping the global energy landscape at record speed.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
  },
  {
    title: 'Rainforest Preservation',
    description: 'Why tropical rainforests are the lungs of our planet and how we can protect them.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
  },
  {
    title: 'Wildlife Conservation',
    description: 'Stories of endangered species and the people fighting to save them.',
    image: 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?w=600&q=80',
  },
  {
    title: 'Sustainable Cities',
    description: 'Urban innovation — from green buildings to zero-waste neighborhoods.',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&q=80',
  },
  {
    title: 'Polar Ice & Climate',
    description: 'What melting ice caps tell us about the urgency of climate action.',
    image: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=600&q=80',
  },
  {
    title: 'Zero Waste Living',
    description: 'Practical tips and real stories from people living without producing trash.',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80',
  },
];

export default function Learn() {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [savedTopics, setSavedTopics] = useState([]);

  // Authentication protection - redirect if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">
            Learn
          </h1>
          <p className="text-lg font-sans text-white/50 max-w-xl">
            Explore the science, stories, and solutions shaping our planet's future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {topics.map((topic, i) => (
            <LearnCard
              key={topic.title}
              title={topic.title}
              description={topic.description}
              image={topic.image}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </div>
  );
}