
import React, { useState, useEffect } from 'react';
import { Splash } from './components/Splash';
import { Studio } from './components/Studio';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Replicating entry animation effect logic
  useEffect(() => {
    // Show splash for at least 3 seconds or based on specific loading logic
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500); // 4.5 seconds for a cinematic entry
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {showSplash ? (
        <Splash onComplete={() => setShowSplash(false)} />
      ) : (
        <div className="animate-in fade-in duration-1000">
          <Studio />
        </div>
      )}
    </div>
  );
};

export default App;
