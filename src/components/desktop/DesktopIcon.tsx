'use client';

import React, { useState, useRef } from 'react';
import { audioEngine } from '@/lib/audio';
import { useDesktopStore } from '@/stores/desktop-store';
import gsap from 'gsap';

interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
  onDoubleClick: () => void;
  isDark?: boolean;
}

export function DesktopIcon({ icon, label, onDoubleClick, isDark = false }: DesktopIconProps) {
  const [selected, setSelected] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const { settings } = useDesktopStore();

  const handleMouseEnter = () => {
    if (iconRef.current && settings.animations) {
      gsap.to(iconRef.current, { scale: 1.06, y: -2, duration: 0.15, ease: 'power2.out' });
    }
  };

  const handleMouseLeave = () => {
    if (iconRef.current && settings.animations) {
      gsap.to(iconRef.current, { scale: 1, y: 0, duration: 0.15, ease: 'power2.out' });
    }
  };

  const handleDoubleClick = () => {
    if (settings.sound) {
      audioEngine.playPop();
    }
    if (iconRef.current && settings.animations) {
      gsap.timeline()
        .to(iconRef.current, { scale: 0.9, duration: 0.08 })
        .to(iconRef.current, { scale: 1.08, duration: 0.12 })
        .to(iconRef.current, { scale: 1, duration: 0.1, onComplete: onDoubleClick });
    } else {
      onDoubleClick();
    }
  };

  return (
    <div
      ref={iconRef}
      className="w-20 h-20 flex flex-col items-center justify-center gap-1.5 cursor-pointer outline-none select-none transition-transform"
      onClick={(e) => {
        e.stopPropagation();
        setSelected(true);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={() => setSelected(false)}
      onDoubleClick={handleDoubleClick}
      tabIndex={0}
    >
      <div className={`p-3 rounded-2xl border transition-all duration-150 shadow-sm ${
        selected 
          ? 'bg-white border-[#111111] text-black shadow-md ring-2 ring-black/10' 
          : isDark 
          ? 'bg-[#181A1D]/80 border-white/10 hover:border-white/20 text-white backdrop-blur-md' 
          : 'bg-white/80 border-[#E5E5E0] hover:border-black/30 hover:bg-white text-[#181A1D] hover:shadow-md'
      }`}>
        {icon}
      </div>
      <span className={`px-2 py-0.5 rounded-full font-dot text-[10px] tracking-wider transition-colors truncate max-w-full ${
        selected 
          ? 'bg-[#111111] text-white font-bold' 
          : 'text-[#444444] font-medium'
      }`}>
        {label}
      </span>
    </div>
  );
}
