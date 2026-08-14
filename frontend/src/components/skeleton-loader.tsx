import { motion } from 'framer-motion';

export function SkeletonLoader({ count = 3, className = '' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="h-24 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg mb-4"
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          style={{
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </div>
  );
}

export function StatSkeletonLoader() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="h-20 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg"
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          style={{
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </div>
  );
}

export function ChartSkeletonLoader() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        >
          <div className="w-12 h-12 bg-gradient-to-r from-slate-700 to-slate-800 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-800 rounded w-full" />
            <div className="h-3 bg-gradient-to-r from-slate-700 to-slate-800 rounded w-3/4" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
