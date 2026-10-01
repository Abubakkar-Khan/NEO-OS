'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { useDesktopStore } from '@/stores/desktop-store';
import { Sparkles, X, MessageSquare } from 'lucide-react';
import gsap from 'gsap';

export type MascotMood = 'neutral' | 'thinking' | 'happy' | 'confused' | 'speaking';

export function Mascot() {
  const { runStatus, reasoning, events, currentCommand } = useHarnessStore();
  const { settings } = useDesktopStore();
  
  const [mood, setMood] = useState<MascotMood>('neutral');
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(
    "Hi! I'm Needle. Type or speak a command, or ask \"What's on screen?\""
  );
  const [showBubble, setShowBubble] = useState(true);

  const mascotRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLSpanElement>(null);
  const rightEyeRef = useRef<HTMLSpanElement>(null);

  // GSAP: Idle floating animation
  useEffect(() => {
    if (settings.animations && mascotRef.current) {
      const floatTween = gsap.to(mascotRef.current, {
        y: -4,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
      return () => {
        floatTween.kill();
      };
    }
  }, [settings.animations]);

  // React to Agent Run Status & Events
  useEffect(() => {
    if (runStatus === 'running') {
      setMood('thinking');
      setSpeechBubbleText("Processing tool sequence with Needle 2...");
      setShowBubble(true);

      if (settings.animations && mascotRef.current) {
        gsap.to(mascotRef.current, {
          scale: 1.06,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    } else if (runStatus === 'completed') {
      setMood('happy');
      // Look for latest meaningful tool completion or reasoning
      const lastCompleted = [...events].reverse().find(e => e.type === 'tool_completed' || e.type === 'TOOL_COMPLETED');
      if (reasoning) {
        setSpeechBubbleText(reasoning);
      } else if (lastCompleted && lastCompleted.result) {
        const text = typeof lastCompleted.result === 'string' 
          ? lastCompleted.result 
          : JSON.stringify(lastCompleted.result).substring(0, 120);
        setSpeechBubbleText(text);
      } else {
        setSpeechBubbleText("All tasks completed successfully!");
      }
      setShowBubble(true);

      if (settings.animations && mascotRef.current) {
        gsap.timeline()
          .to(mascotRef.current, { y: -12, duration: 0.15, ease: 'power2.out' })
          .to(mascotRef.current, { y: 0, duration: 0.2, ease: 'bounce.out' })
          .to(mascotRef.current, { scale: 1, duration: 0.1 });
      }

      const timer = setTimeout(() => {
        setMood('neutral');
      }, 5000);
      return () => clearTimeout(timer);
    } else if (runStatus === 'error') {
      setMood('confused');
      const lastFailed = [...events].reverse().find(e => e.type === 'tool_failed' || e.type === 'TOOL_FAILED' || e.type === 'SYSTEM_ERROR');
      setSpeechBubbleText(lastFailed?.error || "I ran into an issue executing that command.");
      setShowBubble(true);

      if (settings.animations && mascotRef.current) {
        gsap.timeline()
          .to(mascotRef.current, { x: -6, duration: 0.06 })
          .to(mascotRef.current, { x: 6, duration: 0.06 })
          .to(mascotRef.current, { x: -4, duration: 0.06 })
          .to(mascotRef.current, { x: 0, duration: 0.06 });
      }
    } else {
      setMood('neutral');
    }
  }, [runStatus, reasoning, events, settings.animations]);

  // Animate Speech Bubble pop in
  useEffect(() => {
    if (showBubble && speechBubbleText && bubbleRef.current && settings.animations) {
      gsap.fromTo(
        bubbleRef.current,
        { scale: 0.85, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'back.out(2)' }
      );
    }
  }, [speechBubbleText, showBubble, settings.animations]);

  // Render Eyes based on Mood: dots, hyphen, cross, or happy
  const renderEyes = () => {
    switch (mood) {
      case 'thinking':
        return (
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-[#FFFFFF] select-none">
            <span ref={leftEyeRef} className="animate-pulse">-</span>
            <span ref={rightEyeRef} className="animate-pulse">-</span>
          </div>
        );
      case 'happy':
        return (
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#FFFFFF] select-none">
            <span ref={leftEyeRef}>^</span>
            <span ref={rightEyeRef}>^</span>
          </div>
        );
      case 'confused':
        return (
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-[#FF5555] select-none">
            <span ref={leftEyeRef}>×</span>
            <span ref={rightEyeRef}>×</span>
          </div>
        );
      case 'neutral':
      default:
        return (
          <div className="flex items-center gap-2.5 font-mono text-xs font-bold text-[#FFFFFF] select-none">
            <span ref={leftEyeRef} className="w-1.5 h-1.5 bg-[#FFFFFF] rounded-full inline-block" />
            <span ref={rightEyeRef} className="w-1.5 h-1.5 bg-[#FFFFFF] rounded-full inline-block" />
          </div>
        );
    }
  };

  const handleMascotClick = () => {
    setShowBubble(!showBubble);
    if (!showBubble && !speechBubbleText) {
      setSpeechBubbleText("Ready for your next instruction!");
    }
  };

  return (
    <div className="fixed bottom-14 right-5 z-40 flex flex-col items-end pointer-events-none font-sans">
      {/* Speech Bubble Output */}
      {showBubble && speechBubbleText && (
        <div 
          ref={bubbleRef}
          className="pointer-events-auto mb-2 max-w-xs sm:max-w-sm bg-[#FFFFFF] text-[#111111] border-2 border-[#111111] p-3 shadow-xl rounded-md text-xs relative font-mono"
        >
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#E5E5E0]">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#444444]">
              <Sparkles size={11} className="text-[#111111]" />
              <span>NEEDLE MASCOT</span>
            </div>
            <button 
              onClick={() => setShowBubble(false)}
              className="text-[#888888] hover:text-[#111111] p-0.5 rounded-sm"
              title="Close message"
            >
              <X size={12} />
            </button>
          </div>

          <div className="leading-relaxed text-[11px] max-h-36 overflow-y-auto break-words">
            {speechBubbleText}
          </div>

          {/* Speech Bubble Triangle pointer pointing to circle */}
          <div className="absolute -bottom-2 right-5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#111111]" />
          <div className="absolute -bottom-[6px] right-5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-[#FFFFFF]" />
        </div>
      )}

      {/* Retro Circular Mascot */}
      <div
        ref={mascotRef}
        onClick={handleMascotClick}
        className="pointer-events-auto cursor-pointer w-12 h-12 rounded-full bg-[#111111] border-2 border-[#333333] hover:border-[#FFFFFF] shadow-2xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 group relative select-none"
        title="Needle Mascot (Click to toggle status speech)"
      >
        {/* Face */}
        <div className="flex flex-col items-center justify-center">
          {renderEyes()}
          {/* Subtle mouth */}
          <div className={`mt-0.5 transition-all ${
            mood === 'happy' ? 'w-2 h-1 border-b-2 border-[#FFFFFF] rounded-b-full' :
            mood === 'thinking' ? 'w-1 h-1 bg-[#FFFFFF] rounded-full animate-ping' :
            mood === 'confused' ? 'w-2 h-0.5 bg-[#FF5555]' :
            'w-1.5 h-0.5 bg-[#666666] rounded-full'
          }`} />
        </div>

        {/* Small tooltip hint */}
        <span className="sr-only">NeedleOS Mascot</span>
      </div>
    </div>
  );
}
