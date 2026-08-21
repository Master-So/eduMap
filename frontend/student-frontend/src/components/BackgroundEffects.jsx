import React from 'react';

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-slate-950">
      {/* Subtle Grid Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Ambient Glowing Blurred Orbs */}
      {/* Orb 1: Blue Glow (Top Left / Center) */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-blue-600/20 blur-[120px] animate-float opacity-75"
        style={{ willChange: 'transform' }}
      />

      {/* Orb 2: Purple Glow (Top Right / Middle) */}
      <div 
        className="absolute top-[20%] -right-[15%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full bg-purple-600/20 blur-[120px] animate-float-delayed opacity-70"
        style={{ willChange: 'transform' }}
      />

      {/* Orb 3: Emerald Glow (Bottom Center / Left) */}
      <div 
        className="absolute -bottom-[15%] left-[20%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-emerald-600/10 blur-[120px] animate-pulse-slow opacity-60"
        style={{ willChange: 'transform' }}
      />

      {/* Subtle Noise / Radial Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950/80" />
    </div>
  );
}
