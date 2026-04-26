import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

import TopicSidebar from '../components/chat/TopicSidebar';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import ThinkingIndicator from '../components/chat/ThinkingIndicator';
import ContextPanel from '../components/chat/ContextPanel';
import { useTheme } from '@/lib/ThemeContext';
import { apiPost, apiGet } from '../api/base44Client';

const CONTEXT_CARDS = {
  recycling: {
    title: 'Recycling Facts',
    fact: 'Recycling one aluminum can saves enough energy to listen to a full album on your iPod.',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80',
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
};

const THEME_GREETINGS = {
  forests: "🌿 Welcome to the Forest World. Ask me about deforestation, rainforests, tree planting, or how forests fight climate change. Let's explore the lungs of our planet together.",
  ocean: "🌊 You have entered the Ocean World. Ask me about marine life, coral reefs, ocean pollution, or how to protect our seas. The ocean is calling.",
  energy: "⚡ You are now in the Energy World. Ask me about solar power, wind energy, fossil fuels, or how to reduce your energy footprint. Let's power a cleaner future.",
  wildlife: "🔥 Welcome to the Wildfire Dawn. Ask me about endangered species, habitat loss, wildlife conservation, or how human activity affects animals. Every species matters.",
  climate: "❄️ You have entered the Climate World. Ask me about global warming, greenhouse gases, climate tipping points, or what individuals can do. The planet needs us now.",
  recycling: "♻️ Welcome to the Recycling World. Ask me about waste reduction, composting, sustainable products, or how recycling actually works. Small actions create big change.",
};

export default function Chat() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: THEME_GREETINGS.forests,
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [contextCard, setContextCard] = useState(null);
  const [impactCount, setImpactCount] = useState(12847);
  const [conversationId, setConversationId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const scrollRef = useRef(null);

  // Per-theme chat storage persisted in localStorage
  const getChatStore = () => {
    try {
      const raw = localStorage.getItem('chatStore');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  };
  const saveChatStore = (store) => {
    localStorage.setItem('chatStore', JSON.stringify(store));
  };

  // Authentication protection - redirect if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
    }
  }, []);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiGet('/api/auth/me');
        setCurrentUser(data.user);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    };
    loadUser();
  }, []);

  // Load saved chat for current theme on mount, or show greeting
  useEffect(() => {
    const store = getChatStore();
    const saved = store[theme.id];
    if (saved) {
      setMessages(saved.messages);
      setConversationId(saved.conversationId);
      setContextCard(saved.contextCard || null);
    } else {
      setMessages([
        {
          role: 'assistant',
          content: THEME_GREETINGS[theme.id] || THEME_GREETINGS.forests,
        },
      ]);
      setConversationId(null);
      setContextCard(null);
    }
  }, []);

  // When theme changes, save current chat and restore the new theme's chat
  const prevThemeIdRef = useRef(theme.id);
  useEffect(() => {
    const prevId = prevThemeIdRef.current;
    const newId = theme.id;
    if (prevId === newId) return;

    // Save current messages before switching
    setMessages((currentMessages) => {
      setConversationId((currentConvId) => {
        setContextCard((currentCard) => {
          const store = getChatStore();
          store[prevId] = {
            messages: currentMessages,
            conversationId: currentConvId,
            contextCard: currentCard,
          };
          saveChatStore(store);

          // Now restore new theme's chat
          const saved = store[newId];
          if (saved) {
            setMessages(saved.messages);
            setConversationId(saved.conversationId);
            setContextCard(saved.contextCard || null);
          } else {
            setMessages([
              {
                role: 'assistant',
                content: THEME_GREETINGS[newId] || THEME_GREETINGS.forests,
              },
            ]);
            setConversationId(null);
            setContextCard(null);
          }
          return currentCard;
        });
        return currentConvId;
      });
      return currentMessages;
    });
    setIsThinking(false);
    prevThemeIdRef.current = newId;
  }, [theme.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  useEffect(() => {
    const interval = setInterval(() => {
      setImpactCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const detectContext = useCallback((text) => {
    const lower = text.toLowerCase();
    if (lower.includes('recycl')) return CONTEXT_CARDS.recycling;
    if (lower.includes('ocean') || lower.includes('marine') || lower.includes('sea')) return CONTEXT_CARDS.ocean;
    if (lower.includes('energy') || lower.includes('solar') || lower.includes('wind')) return CONTEXT_CARDS.energy;
    if (lower.includes('wildlife') || lower.includes('animal') || lower.includes('species')) return CONTEXT_CARDS.wildlife;
    return null;
  }, []);

  const handleSend = async (text) => {
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    setImpactCount((c) => c + 1);

    const card = detectContext(text);
    if (card) setContextCard(card);

    try {
      // Create conversation if it doesn't exist
      let currentConversationId = conversationId;
      const token = localStorage.getItem('token');

      if (!currentConversationId) {
        const convResponse = await apiPost('/api/conversations', {
          topic: theme.id,
          title: text.slice(0, 50) + (text.length > 50 ? '...' : '')
        });
        currentConversationId = convResponse.id;
        setConversationId(currentConversationId);
      }

      // Send message to backend with streaming
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          conversation_id: currentConversationId,
          topic: theme.id
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';
      let assistantMessageAdded = false;

      setIsThinking(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.content;

            if (content) {
              assistantResponse += content;

              if (!assistantMessageAdded) {
                // First chunk — create the assistant message for the first time
                setMessages((prev) => [
                  ...prev,
                  { role: 'assistant', content: assistantResponse }
                ]);
                assistantMessageAdded = true;
              } else {
                // Every chunk after — update that same message, never create a new one
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  { role: 'assistant', content: assistantResponse }
                ]);
              }
            }
          } catch (e) {
            continue;
          }
        }
      }

      // If stream ended but nothing was added show fallback
      if (!assistantMessageAdded) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I received an empty response. Please try again!' }
        ]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again!' }
      ]);
    }
  };

  // Topic click only changes the visual theme — no message sent
  const handleSelectTopic = () => {};

  const handleClearChat = () => {
    const greeting = [
      {
        role: 'assistant',
        content: THEME_GREETINGS[theme.id] || THEME_GREETINGS.forests,
      },
    ];
    setMessages(greeting);
    setConversationId(null);
    setContextCard(null);
    setIsThinking(false);
    // Also clear from localStorage store so it doesn't restore old messages
    const store = getChatStore();
    store[theme.id] = { messages: greeting, conversationId: null, contextCard: null };
    saveChatStore(store);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden relative">
      <div className="relative z-10 flex w-full h-full">

        {/* Left Sidebar */}
        <div className="hidden lg:flex">
          <TopicSidebar onSelectTopic={handleSelectTopic} impactCount={impactCount} />
        </div>

        {/* Chat Center */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Clear chat button */}
          <div className="flex justify-end px-6 pt-3">
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 text-xs font-sans px-3 py-1.5 rounded-lg transition-all hover:scale-105"
              style={{
                color: theme.accent,
                backgroundColor: theme.accent + '15',
                border: `1px solid ${theme.accent}30`,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
              Clear Chat
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} index={i} total={messages.length} />
              ))}
              {isThinking && <ThinkingIndicator key="thinking" />}
            </AnimatePresence>
          </div>
          <ChatInput onSend={handleSend} disabled={isThinking} activeThemeId={theme.id} />
        </div>

        {/* Right Panel */}
        <div className="hidden xl:flex">
          <ContextPanel contextCard={contextCard} />
        </div>

      </div>
    </div>
  );
}