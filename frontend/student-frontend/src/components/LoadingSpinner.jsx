import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  fullscreen = false 
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="relative flex items-center justify-center">
        {/* Glowing pulse ring */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md animate-pulse" />
        
        {/* Spinning gradient circle */}
        <div className="relative">
          <Loader2 className={`${sizeMap[size] || sizeMap.md} text-blue-400 animate-spin`} />
        </div>
      </div>

      {text && (
        <p className="text-sm font-medium text-slate-400 tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}
