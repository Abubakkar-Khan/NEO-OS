'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { useDesktopStore } from '@/stores/desktop-store';
import { backendClient } from '@/services/api-client';
import { agentRunner } from '@/agent/runner';
import { audioEngine } from '@/lib/audio';
import { Sparkles, X, ChevronRight, Terminal } from 'lucide-react';
import gsap from 'gsap';

export type MascotMood = 'neutral' | 'curious' | 'thinking' | 'happy' | 'alert';

export function Mascot() {
  const { runStatus, reasoning, events, currentCommand } = useHarnessStore();
  const { settings } = useDesktopStore();

  const [mood, setMood] = useState<MascotMood>('neutral');
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(
    "Ready. Type or speak a command, or ask \"What's on screen?\""
  );
  const [showBubble, setShowBubble] = useState(true);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  const mascotRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Alive: Mouse Pupil Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const dist = Math.hypot(deltaX, deltaY);

      if (dist > 0) {
        const maxDist = 4; // Max pupil travel distance in px
        const factor = Math.min(dist / 300, 1);
        setPupilOffset({
          x: (deltaX / dist) * maxDist * factor,
          y: (deltaY / dist) * maxDist * factor,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Alive: Natural Spontaneous Blinking Loop
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const scheduleBlink = () => {
      const nextInterval = 3500 + Math.random() * 4000;
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 160);
      }, nextInterval);
    };

    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  // Alive: Idle Breathing Floating Animation via GSAP
  useEffect(() => {
    if (settings.animations && mascotRef.current) {
      const floatTween = gsap.to(mascotRef.current, {
        y: -5,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      return () => {
        floatTween.kill();
      };
    }
  }, [settings.animations]);

  // Reactive state management when agent runs
  useEffect(() => {
    if (runStatus === 'running') {
      setMood('thinking');
      setSpeechBubbleText("Processing through autonomous specialists...");
      setShowBubble(true);

      if (settings.animations && mascotRef.current) {
        gsap.to(mascotRef.current, {
          scale: 1.05,
          duration: 0.25,
          ease: 'power2.out'
        });
      }
    } else if (runStatus === 'completed') {
      setMood('happy');
      if (settings.sound) {
        audioEngine.playSuccess();
      }

      const lastCompleted = [...events].reverse().find(e => e.type === 'tool_completed' || e.type === 'TOOL_COMPLETED');
      if (reasoning) {
        setSpeechBubbleText(reasoning);
      } else if (lastCompleted && lastCompleted.result) {
        setSpeechBubbleText(`Done: ${String(lastCompleted.result)}`);
      } else {
        setSpeechBubbleText("Workflow executed successfully.");
      }
      setShowBubble(true);

      if (settings.animations && mascotRef.current) {
        gsap.to(mascotRef.current, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)'
        });
      }

      // Return to neutral after 5 seconds
      const timer = setTimeout(() => {
        setMood('neutral');
      }, 5000);
      return () => clearTimeout(timer);
    } else if (runStatus === 'error') {
      setMood('alert');
      if (settings.sound) {
        audioEngine.playAlert();
      }
      setSpeechBubbleText("An action could not be completed.");
      setShowBubble(true);
    }
  }, [runStatus, reasoning, events, settings.animations, settings.sound]);

  // Interactive Click Poke
  const handlePoke = () => {
    if (settings.sound) {
      audioEngine.playPop();
    }
    setMood('curious');
    setShowBubble(true);
    setSpeechBubbleText("Listening! What would you like me to do next?");

    if (settings.animations && mascotRef.current) {
      gsap.fromTo(
        mascotRef.current,
        { scale: 0.92, rotate: -4 },
        { scale: 1, rotate: 0, duration: 0.4, ease: 'back.out(2)' }
      );
    }
  };

  const handleQuickCommand = async (cmd: string) => {
    if (settings.sound) {
      audioEngine.playClick();
    }
    try {
      await backendClient.runCommand(cmd);
    } catch {
      await agentRunner.run(cmd);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end select-none pointer-events-none">
      {/* Speech Balloon */}
      {showBubble && speechBubbleText && (
        <div
          ref={bubbleRef}
          className="pointer-events-auto mb-3 max-w-xs bg-[#FFFFFF] border border-[#E5E5E0] shadow-xl rounded-2xl p-3.5 text-xs text-[#111111] transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 font-dot text-[10px] text-[#666666]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
              <span>NEEDLE 3 OS</span>
            </div>
            <button
              onClick={() => setShowBubble(false)}
              className="text-[#999999] hover:text-[#111111] p-0.5 rounded transition-colors"
            >
              <X size={12} />
            </button>
          </div>

          <p className="text-[12px] leading-relaxed text-[#222222] font-sans">
            {speechBubbleText}
          </p>

          {/* Quick suggestions when idle */}
          {runStatus !== 'running' && (
            <div className="mt-2.5 pt-2 border-t border-[#F0F0EC] flex flex-wrap gap-1">
              {[
                "Open editor and write Hello",
                "Create Notes folder",
                "Search Next.js docs"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickCommand(suggestion)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4F4F0] hover:bg-[#111111] hover:text-[#FFFFFF] text-[#555555] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{suggestion}</span>
                  <ChevronRight size={10} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nothing OS Styled Tactile Mascot Sphere */}
      <div
        ref={mascotRef}
        onClick={handlePoke}
        title="Needle 3 AI Companion (Click to poke)"
        className="pointer-events-auto w-14 h-14 rounded-full bg-[#FFFFFF] border border-[#E0E0DB] shadow-lg flex items-center justify-center cursor-pointer relative hover:shadow-xl transition-shadow"
      >
        {/* Signature Nothing Red Dot Accent */}
        <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#D71920] shadow-[0_0_6px_rgba(215,25,32,0.6)] animate-pulse" />

        {/* Eyes & Expressions */}
        <div className="flex items-center gap-3">
          {/* Left Eye */}
          <div className="w-3.5 h-3.5 rounded-full bg-[#F0F0EA] flex items-center justify-center overflow-hidden border border-[#D5D5CF]">
            {isBlinking ? (
              <span className="w-2.5 h-[2px] bg-[#111111]" />
            ) : mood === 'thinking' ? (
              <span className="w-2.5 h-[2px] bg-[#111111] animate-pulse" />
            ) : mood === 'happy' ? (
              <span className="text-[11px] font-bold text-[#111111] leading-none">^</span>
            ) : mood === 'alert' ? (
              <span className="text-[10px] font-bold text-[#D71920] leading-none">×</span>
            ) : (
              <span
                className="w-2 h-2 rounded-full bg-[#111111] transition-transform duration-75"
                style={{
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`
                }}
              />
            )}
          </div>

          {/* Right Eye */}
          <div className="w-3.5 h-3.5 rounded-full bg-[#F0F0EA] flex items-center justify-center overflow-hidden border border-[#D5D5CF]">
            {isBlinking ? (
              <span className="w-2.5 h-[2px] bg-[#111111]" />
            ) : mood === 'thinking' ? (
              <span className="w-2.5 h-[2px] bg-[#111111] animate-pulse" />
            ) : mood === 'happy' ? (
              <span className="text-[11px] font-bold text-[#111111] leading-none">^</span>
            ) : mood === 'alert' ? (
              <span className="text-[10px] font-bold text-[#D71920] leading-none">×</span>
            ) : (
              <span
                className="w-2 h-2 rounded-full bg-[#111111] transition-transform duration-75"
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
