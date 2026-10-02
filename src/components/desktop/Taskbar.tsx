'use client';

import { useState, useEffect, useRef } from 'react';
import { useDesktopStore } from '@/stores/desktop-store';
import { useHarnessStore } from '@/stores/harness-store';
import { audioEngine } from '@/lib/audio';
import { Layout, Volume2, VolumeX, Cpu, Activity, Sparkles } from 'lucide-react';
import gsap from 'gsap';

interface TaskbarProps {
  view: 'desktop' | 'harness';
  onViewChange: (view: 'desktop' | 'harness') => void;
}

export function Taskbar({ view, onViewChange }: TaskbarProps) {
  const [time, setTime] = useState<Date | null>(null);
  const { openWindows, activeWindowId, focusApp, minimizeApp, settings, toggleSound } = useDesktopStore();
  const { runStatus, activeAgent } = useHarnessStore();
  const taskbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleView = () => {
    if (settings.sound) audioEngine.playPop();
    const nextView = view === 'desktop' ? 'harness' : 'desktop';
    if (settings.animations && taskbarRef.current) {
      gsap.fromTo(
        taskbarRef.current.querySelector('.mode-toggle-btn'),
        { scale: 0.94 },
        { scale: 1, duration: 0.2, ease: 'back.out(2)' }
      );
    }
    onViewChange(nextView);
  };

  const handleWindowClick = (winId: string, isActive: boolean) => {
    if (settings.sound) audioEngine.playClick();
    if (isActive) {
      minimizeApp(winId);
    } else {
      focusApp(winId);
    }
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!settings.sound) {
      setTimeout(() => audioEngine.playPop(), 50);
    }
  };

  return (
    <div 
      ref={taskbarRef}
      className="h-11 bg-[#101214] text-[#FFFFFF] flex items-center justify-between px-3.5 border-t border-white/10 shrink-0 z-[100] font-sans text-xs select-none shadow-2xl"
    >
      <div className="flex items-center gap-3 h-full">
        {/* Nothing OS Brand Pill */}
        <div 
          onClick={handleToggleView}
          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          {/* Signature Nothing Red Dot */}
          <span className="w-2 h-2 rounded-full bg-[#D71920] shadow-[0_0_8px_rgba(215,25,32,0.8)]" />
          <span className="font-dot text-[11px] font-bold text-white tracking-widest">
            NEO-OS (3)
          </span>
        </div>

        {/* Running Windows as Nothing Pill Badges */}
        <div className="flex items-center gap-1.5 h-full py-1">
          {openWindows.map((win) => {
            const isActive = activeWindowId === win.id && !win.minimized;
            return (
              <button
                key={win.id}
                onClick={() => handleWindowClick(win.id, isActive)}
                className={`h-full px-3 rounded-full border truncate max-w-[170px] flex items-center gap-2 transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-white text-black border-white font-semibold shadow-md'
                    : win.minimized
                    ? 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                    : 'bg-white/10 border-white/15 text-white/85 hover:bg-white/15'
                }`}
                title={win.title}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-[#D71920]' : 'bg-white/40'
                }`} />
                <span className="truncate text-[11px] font-medium">{win.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2.5 h-full py-1">
        {/* Active Multi-Agent Execution Indicator */}
        {runStatus === 'running' && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#D71920]/15 border border-[#D71920]/40 rounded-full text-[#FF4D52] text-[11px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] shadow-[0_0_8px_#D71920]" />
            <span className="font-dot font-bold tracking-wider">
              {activeAgent ? activeAgent.toUpperCase() : 'AGENT DISPATCH'}
            </span>
          </div>
        )}

        {/* Audio Micro-Haptics Toggle */}
        <button
          onClick={handleToggleSound}
          title={settings.sound ? 'Mute synthesized audio haptics' : 'Enable synthesized audio haptics'}
          className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
            settings.sound 
              ? 'bg-white/10 border-white/20 text-white' 
              : 'bg-white/5 border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          {settings.sound ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>

        {/* Mission Control Room Toggle */}
        <button
          onClick={handleToggleView}
          className="mode-toggle-btn h-full px-3 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/15 rounded-full flex items-center gap-1.5 font-medium transition-all text-[11px] cursor-pointer"
        >
          <Layout size={12} className={view === 'harness' ? 'text-[#D71920]' : 'text-white/60'} />
          <span className="font-sans font-medium text-white/90">
            {view === 'desktop' ? 'Control Room' : 'Desktop Shell'}
          </span>
        </button>

        {/* Nothing Style Dot-Matrix Digital Clock with Seconds */}
        <div className="px-3 py-1 flex items-center select-none font-dot text-[11px] text-white/80 border-l border-white/10 pl-3">
          {time ? (
            <span>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
          ) : (
            '--:--:--'
          )}
        </div>
      </div>
    </div>
  );
}
