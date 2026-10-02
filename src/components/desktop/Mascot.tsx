'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { useDesktopStore } from '@/stores/desktop-store';
import { audioEngine } from '@/lib/audio';
import gsap from 'gsap';

export type MascotMood = 'neutral' | 'curious' | 'thinking' | 'happy' | 'alert';

export function Mascot() {
  const { runStatus, reasoning, events } = useHarnessStore();
  const { settings } = useDesktopStore();

  const [mood, setMood] = useState<MascotMood>('neutral');
  const [toastText, setToastText] = useState<string | null>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  const mascotRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (text: string, durationMs: number = 2500) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastText(text);
    toastTimeoutRef.current = setTimeout(() => {
      setToastText(null);
    }, durationMs);
  };

  // ── 1. Biological Eye Cursor Tracking ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      const maxRadius = 2.2;
      const clampedDist = Math.min(distance / 120, 1) * maxRadius;
      const angle = Math.atan2(deltaY, deltaX);

      setPupilOffset({
        x: Math.cos(angle) * clampedDist,
        y: Math.sin(angle) * clampedDist
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ── 2. Biological Spontaneous Blinking Loop ──
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const nextDelay = Math.random() * 4000 + 2500;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 130);
      }, nextDelay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimer);
  }, []);

  // ── 3. Reactive Moods & Toast on Agent Lifecycle ──
  useEffect(() => {
    if (runStatus === 'running') {
      setMood('thinking');
      showToast('Executing task...', 3500);
      if (settings.animations && mascotRef.current) {
        gsap.to(mascotRef.current, { scale: 1.05, duration: 0.25, yoyo: true, repeat: -1 });
      }
    } else if (runStatus === 'completed') {
      setMood('happy');
      if (settings.sound) {
        audioEngine.playSuccess();
      }
      if (settings.animations && mascotRef.current) {
        gsap.killTweensOf(mascotRef.current);
        gsap.to(mascotRef.current, { scale: 1, duration: 0.2 });
      }
      const lastCompleted = [...events].reverse().find(e => e.type === 'tool_completed' || e.type === 'TOOL_COMPLETED');
      const text = lastCompleted?.tool ? `Done: ${lastCompleted.tool}` : 'Task completed';
      showToast(text, 2500);

      const resetTimer = setTimeout(() => setMood('neutral'), 3000);
      return () => clearTimeout(resetTimer);
    } else if (runStatus === 'error') {
      setMood('alert');
      if (settings.sound) {
        audioEngine.playAlert();
      }
      showToast('Action could not complete', 3000);
    } else {
      setMood('neutral');
      if (settings.animations && mascotRef.current) {
        gsap.killTweensOf(mascotRef.current);
        gsap.to(mascotRef.current, { scale: 1, duration: 0.2 });
      }
    }
  }, [runStatus, events, settings.animations, settings.sound]);

  // ── 4. Tactile Poke Interaction ──
  const handlePoke = () => {
    if (settings.sound) {
      audioEngine.playPop();
    }
    setMood('curious');
    showToast('Ready for commands', 2000);

    if (settings.animations && mascotRef.current) {
      gsap.fromTo(
        mascotRef.current,
        { scale: 0.88, rotate: -6 },
        { scale: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }
      );
    }
  };

  return (
    <div className="fixed bottom-14 right-4 z-40 flex flex-col items-end select-none pointer-events-none">
      {/* Minimalist Auto-Dismissing Toast Pill */}
      {toastText && (
        <div className="pointer-events-auto mb-2 px-3 py-1 bg-white/95 backdrop-blur-md border border-[#E0E0DA] shadow-md rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
          <span className="text-[11px] font-mono font-medium text-[#111111]">{toastText}</span>
        </div>
      )}

      {/* Simplified Tactile Sphere */}
      <div
        ref={mascotRef}
        onClick={handlePoke}
        title="NEO Companion"
        className="pointer-events-auto w-10 h-10 rounded-full bg-white border border-[#E0E0DA] shadow-sm hover:shadow-md flex items-center justify-center cursor-pointer relative active:scale-90 transition-shadow"
      >
        {/* Subtle Nothing Red Status Dot */}
        <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full transition-colors ${
          mood === 'thinking' ? 'bg-[#D71920] animate-ping' : mood === 'happy' ? 'bg-[#10B981]' : 'bg-[#D71920]'
        }`} />

        {/* Clean Eye Pupils */}
        <div className="flex items-center gap-2">
          {/* Left Eye */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#EFEFEA] flex items-center justify-center overflow-hidden">
            {isBlinking ? (
              <span className="w-2 h-[1.5px] bg-[#111111]" />
            ) : mood === 'thinking' ? (
              <span className="w-2 h-[1.5px] bg-[#111111] animate-pulse" />
            ) : mood === 'happy' ? (
              <span className="text-[9px] font-bold text-[#111111] leading-none">^</span>
            ) : (
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#111111] transition-transform duration-75"
                style={{
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`
                }}
              />
            )}
          </div>

          {/* Right Eye */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#EFEFEA] flex items-center justify-center overflow-hidden">
            {isBlinking ? (
              <span className="w-2 h-[1.5px] bg-[#111111]" />
            ) : mood === 'thinking' ? (
              <span className="w-2 h-[1.5px] bg-[#111111] animate-pulse" />
            ) : mood === 'happy' ? (
              <span className="text-[9px] font-bold text-[#111111] leading-none">^</span>
            ) : (
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#111111] transition-transform duration-75"
                style={{
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
