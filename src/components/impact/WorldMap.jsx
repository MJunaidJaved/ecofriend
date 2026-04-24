import { motion } from 'framer-motion';

const hotspots = [
  { x: '20%', y: '35%', label: 'North America', intensity: 0.9 },
  { x: '48%', y: '30%', label: 'Europe', intensity: 0.95 },
  { x: '52%', y: '50%', label: 'Africa', intensity: 0.6 },
  { x: '65%', y: '35%', label: 'Asia', intensity: 0.85 },
  { x: '30%', y: '65%', label: 'South America', intensity: 0.7 },
  { x: '80%', y: '70%', label: 'Oceania', intensity: 0.75 },
];

export default function WorldMap() {
  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden bg-card/40 border border-border/30">
      {/* Simplified map silhouette */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Glowing dots */}
      {hotspots.map((spot, i) => (
        <motion.div
          key={spot.label}
          className="absolute"
          style={{ left: spot.x, top: spot.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute -inset-3 rounded-full bg-primary/20"
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
          />
          {/* Core dot */}
          <div
            className="w-3 h-3 rounded-full bg-primary shadow-lg"
            style={{
              boxShadow: `0 0 ${12 * spot.intensity}px ${4 * spot.intensity}px hsla(142, 71%, 45%, ${spot.intensity * 0.5})`,
            }}
          />
          {/* Label */}
          <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-sans text-muted-foreground">
            {spot.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}