
import React, { useState, useEffect } from 'react';

interface SplashProps {
  onComplete: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-1000">
      <div className="mb-8 overflow-hidden">
        <h1 className="text-4xl md:text-6xl font-serif-elegant tracking-[0.2em] animate-pulse">
          PHANTOM STUDIO
        </h1>
      </div>
      
      <div className="relative w-64 h-px bg-zinc-800 overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-white transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 font-mono text-zinc-500 tracking-widest uppercase text-xs">
        System Loading / {progress}%
      </div>

      <div className="absolute bottom-12 text-[10px] text-zinc-700 uppercase tracking-[0.3em]">
        © 2024 AI Vision Laboratory / All Rights Reserved
      </div>
    </div>
  );
};
