import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { TTLogo } from '../common/TTLogo';

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  text: string;
}

export const TapCoin: React.FC = () => {
  const { performTap, energy } = useApp();
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      setIsPressed(true);

      const rect = containerRef.current?.getBoundingClientRect();
      const x = rect ? e.clientX - rect.left : 100;
      const y = rect ? e.clientY - rect.top : 100;

      const newId = Date.now() + Math.random();
      const newParticle: FloatingNumber = {
        id: newId,
        x,
        y,
        text: '+1',
      };

      setFloatingNumbers((prev) => [...prev.slice(-15), newParticle]);

      // Trigger tap in context
      performTap(1);
    },
    [performTap]
  );

  const handlePointerUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleParticleAnimationComplete = useCallback((id: number) => {
    setFloatingNumbers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const isOutOfEnergy = energy.current <= 0;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center my-3 select-none touch-manipulation"
    >
      {/* Floating Score Particles */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
        <AnimatePresence>
          {floatingNumbers.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 1, y: particle.y - 20, x: particle.x - 12, scale: 0.9 }}
              animate={{ opacity: 0, y: particle.y - 90, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              onAnimationComplete={() => handleParticleAnimationComplete(particle.id)}
              className="absolute text-xl font-black font-mono tracking-tight text-[#00F0FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.9)]"
            >
              {particle.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Ambient Radial Backlight Glow */}
      <div
        className={`absolute w-64 h-64 rounded-full transition-all duration-300 pointer-events-none ${
          isOutOfEnergy
            ? 'bg-[#FF3366]/10 blur-2xl'
            : isPressed
            ? 'bg-[#00F0FF]/35 blur-3xl scale-110'
            : 'bg-[#00F0FF]/20 blur-2xl animate-pulse'
        }`}
      />

      {/* Outer Orbit Tech Ring */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full flex items-center justify-center p-3">
        <div
          className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 pointer-events-none ${
            isOutOfEnergy
              ? 'border-neutral-700'
              : 'border-[#00F0FF]/30 animate-[spin_20s_linear_infinite]'
          }`}
        />
        <div
          className={`absolute inset-2 rounded-full border transition-all duration-700 pointer-events-none ${
            isOutOfEnergy
              ? 'border-neutral-800'
              : 'border-[#FFB800]/20 animate-[spin_28s_linear_infinite_reverse]'
          }`}
        />

        {/* The Tap Coin Button */}
        <motion.button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          whileTap={{ scale: 0.94 }}
          animate={{ scale: isPressed ? 0.95 : 1 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className={`relative w-full h-full rounded-full cursor-pointer focus:outline-none transition-shadow ${
            isOutOfEnergy
              ? 'opacity-65 grayscale'
              : 'active:shadow-[0_0_40px_rgba(0,240,255,0.5)]'
          }`}
          style={{
            background:
              'radial-gradient(circle at 35% 30%, #1A2438 0%, #0D1322 55%, #050810 100%)',
            boxShadow: isPressed
              ? 'inset 0 10px 20px rgba(0,0,0,0.8), 0 0 25px rgba(0,240,255,0.4)'
              : 'inset 0 2px 4px rgba(255,255,255,0.2), 0 15px 35px rgba(0,0,0,0.7), 0 0 20px rgba(0,240,255,0.2)',
          }}
          aria-label="Tap to mine TAP tokens"
        >
          {/* Subtle Outer Metal Rim */}
          <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />

          {/* Inner Glowing Bevel */}
          <div className="absolute inset-3 rounded-full border border-[#00F0FF]/30 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF]/10 via-transparent to-[#FFB800]/10" />

            {/* Central TT Logo & Visual Identity */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <TTLogo size="xl" />
              <span className="mt-1 text-xs font-black tracking-widest text-[#00F0FF] uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
                TAP
              </span>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Bottom Hint */}
      <span className="mt-2 text-[11px] font-medium tracking-wide text-neutral-400">
        {isOutOfEnergy ? (
          <span className="text-[#FF3366] font-semibold">Energy depleted. Recharging...</span>
        ) : (
          <span>Tap the TT coin to mine TAP</span>
        )}
      </span>
    </div>
  );
};
