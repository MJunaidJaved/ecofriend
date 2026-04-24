import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Leaf } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export default function ChatMessage({ message, index, total }) {
  const { theme } = useTheme();
  const isUser = message.role === 'user';
  const ref = useRef(null);

  const isRecent = index >= total - 3;
  const distanceFromEnd = total - 1 - index;

  // Determine bubble shape from theme
  const isSharp = theme.id === 'energy';
  const bubbleRadius = isSharp ? '0.5rem' : '1rem';

  const userBubbleStyle = {
    background: theme.id === 'ocean' ? 'rgba(34, 211, 238, 0.12)' :
                theme.id === 'energy' ? 'rgba(234, 179, 8, 0.12)' :
                theme.id === 'wildlife' ? 'rgba(180, 83, 9, 0.18)' :
                theme.id === 'climate' ? 'rgba(96, 165, 250, 0.12)' :
                theme.id === 'recycling' ? 'rgba(132, 204, 22, 0.12)' :
                'rgba(74, 222, 128, 0.1)',
    border: `1px solid ${theme.accent}33`,
    borderRadius: bubbleRadius,
  };

  return (
    <motion.div
      ref={ref}
      initial={{ y: 20, opacity: 0 }}
      animate={{
        y: 0,
        opacity: isRecent ? 1 : Math.max(0.38, 1 - distanceFromEnd * 0.15),
        scale: isRecent ? 1 : Math.max(0.95, 1 - distanceFromEnd * 0.012),
      }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
          style={{ backgroundColor: theme.accent + '22', border: `1px solid ${theme.accent}33` }}
        >
          <Leaf className="w-4 h-4" style={{ color: theme.accent }} />
        </div>
      )}

      <motion.div
        className={`max-w-[75%] px-5 py-3.5${!isUser && theme.id === 'wildlife' ? ' heat-haze' : ''}`}
        style={isUser ? userBubbleStyle : {
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(12px)',
          borderLeft: `2px solid ${theme.accent}66`,
          borderRadius: bubbleRadius,
        }}
        animate={!isUser ? {
          borderLeftColor: [
            `${theme.accent}44`,
            `${theme.accent}cc`,
            `${theme.accent}44`,
          ],
        } : {}}
        transition={!isUser ? {
          duration: 3,
          ease: 'easeInOut',
          repeat: Infinity,
        } : {}}
      >
        {isUser ? (
          <p className="text-sm font-sans leading-relaxed text-white/90">{message.content}</p>
        ) : (
          <div className="text-sm font-sans leading-relaxed prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="my-1.5 leading-relaxed text-white/85">{children}</p>,
                strong: ({ children }) => <strong style={{ color: theme.accent }} className="font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc text-white/80">{children}</ul>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                a: ({ children, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: theme.accent }} className="underline underline-offset-2">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}