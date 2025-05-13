
'use client';
import localFont from 'next/font/local';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const myFont = localFont({
  src: '../fonts/ReadexPro-Bold.ttf',
  weight: '900',
});

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const router = useRouter();
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Set window dimensions on mount
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);

    // Optional: Play sound effect (uncomment if desired)
    // const audio = new Audio('/sounds/splash.mp3');
    // audio.play();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-950 via-indigo-900 to-pink-300"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent"
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Particle System */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/30"
                style={{
                  width: Math.random() * 4 + 2,
                  height: Math.random() * 4 + 2,
                }}
                initial={{
                  x: Math.random() * windowSize.width,
                  y: windowSize.height,
                }}
                animate={{
                  y: -1000,
                  opacity: [0.8, 0],
                  scale: [1, 0.5],
                }}
                transition={{
                  duration: Math.random() * 4 + 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          {/* Logo and Text */}
          <div className={`text-center ${myFont.className}`}>
            <motion.div
              className="relative mb-8 flex items-center justify-center"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {/* Animated Logo */}
              <motion.div
                className="relative h-28 w-28 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md shadow-2xl"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.15, 1],
                  boxShadow: [
                    '0 0 20px rgba(255, 255, 255, 0.3)',
                    '0 0 40px rgba(255, 255, 255, 0.5)',
                    '0 0 20px rgba(255, 255, 255, 0.3)',
                  ],
                }}
                transition={{
                  rotate: { duration: 5, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <div className="flex h-full w-full items-center justify-center text-5xl font-extrabold text-white drop-shadow-lg">
                  R
                </div>
              </motion.div>

              {/* Glow Effect */}
              <motion.div
                className="absolute h-40 w-40 rounded-full bg-pink-600/40 blur-3xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Title with Staggered Animation */}
            <motion.h1
              className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
            >
              {[...'روائس للاستقدام'].map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="mt-3 text-xl text-white/90 drop-shadow-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
            >
              Rawaes Recruitment
            </motion.p>

            {/* Dynamic Loading Bar */}
            <motion.div
              className="mt-10 h-1.5 w-72 rounded-full bg-white/10 overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.8, ease: 'easeInOut' }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}