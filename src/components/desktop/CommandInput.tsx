'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Mic, ArrowUp, Sparkles, Command, ArrowRight } from 'lucide-react';
import { agentRunner } from '@/agent/runner';
import { backendClient } from '@/services/api-client';
import { useDesktopStore } from '@/stores/desktop-store';
import { audioEngine } from '@/lib/audio';
import gsap from 'gsap';

const DEFAULT_INITIAL_HISTORY = [
  'Open the text editor, create a file called hello.txt, write Hello from Needle, save it, then open the browser and search for Next.js.',
  "What's on my screen?",
  'Open the browser and search for Nothing OS design system',
  'Create a folder called Projects',
  'Reset desktop'
];

export function CommandInput() {
  const [command, setCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Terminal Command History State
  const [history, setHistory] = useState<string[]>(DEFAULT_INITIAL_HISTORY);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [draft, setDraft] = useState<string>('');

  const { settings } = useDesktopStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const waveTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('neo_os_cmd_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Global hotkey Cmd+K / Ctrl+K & auto-focus
  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        if (settings.sound) {
          audioEngine.playPop();
        }
        if (containerRef.current) {
          gsap.fromTo(
            containerRef.current,
            { scale: 0.98 },
            { scale: 1, duration: 0.25, ease: 'back.out(2)' }
          );
        }
      }
    };

    const handleGlobalFocus = () => {
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', handleKeyDownGlobal);
    window.addEventListener('needleos:focus-input', handleGlobalFocus);
    return () => {
      window.removeEventListener('keydown', handleKeyDownGlobal);
      window.removeEventListener('needleos:focus-input', handleGlobalFocus);
    };
  }, [settings.sound]);

  useEffect(() => {
    if (!isRunning) {
      inputRef.current?.focus();
    }
  }, [isRunning]);

  // Live Planned Action Predictions (Nothing OS Utilitarian Chips)
  const predictedActions = useMemo(() => {
    const text = command.trim().toLowerCase();
    if (text.length < 3) return [];

    const actions: { domain: string; action: string }[] = [];

    if (text.includes('editor') || text.includes('text')) {
      actions.push({ domain: 'Desktop', action: 'Open Editor' });
    }
    if (text.includes('browser') || text.includes('web')) {
      actions.push({ domain: 'Browser', action: 'Open Browser' });
    }
    if (text.includes('folder') || text.includes('directory')) {
      actions.push({ domain: 'Files', action: 'Create Folder' });
    }
    if (text.includes('create') && (text.includes('file') || text.includes('.txt') || text.includes('.md'))) {
      actions.push({ domain: 'Files', action: 'Create File' });
    }
    if (text.includes('write') || text.includes('type') || text.includes('insert')) {
      actions.push({ domain: 'Editor', action: 'Insert Text' });
    }
    if (text.includes('save')) {
      actions.push({ domain: 'Editor', action: 'Save File' });
    }
    if (text.includes('search') || text.includes('look up')) {
      actions.push({ domain: 'Browser', action: 'Search Query' });
    }
    if (text.includes('time') || text.includes('system') || text.includes("what's on")) {
      actions.push({ domain: 'System', action: 'Query State' });
    }

    return actions.slice(0, 4);
  }, [command]);

  // GSAP: Voice recording wave animation
  useEffect(() => {
    if (isRecording) {
      const bars = containerRef.current?.querySelectorAll('.voice-bar');
      if (bars && bars.length > 0) {
        waveTimelineRef.current = gsap.timeline({ repeat: -1, yoyo: true })
          .to(bars, {
            scaleY: 2.6,
            duration: 0.22,
            stagger: 0.08,
            ease: 'power1.inOut'
          });
      }
    } else {
      if (waveTimelineRef.current) {
        waveTimelineRef.current.kill();
        waveTimelineRef.current = null;
      }
      const bars = containerRef.current?.querySelectorAll('.voice-bar');
      if (bars) {
        gsap.to(bars, { scaleY: 1, duration: 0.15 });
      }
    }
    return () => {
      if (waveTimelineRef.current) {
        waveTimelineRef.current.kill();
      }
    };
  }, [isRecording]);

  const handleSend = async () => {
    const trimmed = command.trim();
    if (!trimmed || isRunning) return;
    setIsRunning(true);

    if (settings.sound) {
      audioEngine.playClick();
    }

    // Save to command history
    const nextHistory = [...history.filter(h => h !== trimmed), trimmed];
    setHistory(nextHistory);
    setHistoryIndex(-1);
    setDraft('');
    try {
      localStorage.setItem('neo_os_cmd_history', JSON.stringify(nextHistory.slice(-50)));
    } catch {
      // Ignore
    }

    // GSAP: Send icon feedback
    if (arrowRef.current) {
      gsap.timeline()
        .to(arrowRef.current, { y: -3, scale: 0.9, duration: 0.1 })
        .to(arrowRef.current, { y: 0, scale: 1, duration: 0.2, ease: 'back.out(2)' });
    }

    try {
      try {
        await backendClient.runCommand(trimmed);
      } catch (err) {
        console.warn('Backend connection issue, falling back to local runner:', err);
        await agentRunner.run(trimmed);
      }
      setCommand('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
      return;
    }

    // Terminal History: ArrowUp
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;

      if (historyIndex === -1) {
        setDraft(command);
        const newIdx = 0;
        setHistoryIndex(newIdx);
        setCommand(history[history.length - 1 - newIdx]);
      } else if (historyIndex < history.length - 1) {
        const newIdx = historyIndex + 1;
        setHistoryIndex(newIdx);
        setCommand(history[history.length - 1 - newIdx]);
      }
      return;
    }

    // Terminal History: ArrowDown
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIdx = historyIndex - 1;
        setHistoryIndex(newIdx);
        setCommand(history[history.length - 1 - newIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand(draft);
      }
      return;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not natively supported in this browser. Please type your command.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      if (settings.sound) audioEngine.playPop();
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCommand(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  return (
    <div className="w-full flex flex-col items-center gap-1.5 select-none font-sans">
      {/* Live Action Preview Chips */}
      {predictedActions.length > 0 && !isRunning && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1C1E]/80 backdrop-blur-md border border-white/10 text-[10px] text-white/80 shadow-md animate-fadeIn">
          <span className="text-[#D71920] font-dot font-bold">PLAN:</span>
          {predictedActions.map((act, i) => (
            <React.Fragment key={i}>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-medium">
                {act.domain}: {act.action}
              </span>
              {i < predictedActions.length - 1 && (
                <ArrowRight size={10} className="text-white/40" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main Nothing OS Spotlight Pill Bar */}
      <div 
        ref={containerRef}
        className={`w-full max-w-2xl rounded-full bg-[#141618] border transition-all duration-200 flex items-center p-1.5 shadow-2xl ${
          isRunning 
            ? 'border-[#D71920] shadow-[0_0_20px_rgba(215,25,32,0.3)]' 
            : 'border-white/15 hover:border-white/25 focus-within:border-white/40 focus-within:shadow-[0_0_25px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Left Badge */}
        <div className="pl-3.5 pr-1.5 text-white/50 flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full transition-colors ${
            isRunning ? 'bg-[#D71920] animate-ping' : 'bg-white/40'
          }`} />
          <span className="font-dot text-[10px] font-bold tracking-wider text-white/80 hidden sm:inline">
            NEO 3
          </span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => {
            setCommand(e.target.value);
            if (historyIndex !== -1) {
              setHistoryIndex(-1);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isRunning 
              ? 'Executing multi-step autonomous actions with Needle 3...' 
              : isRecording 
              ? 'Listening to speech...' 
              : 'Search or command (Cmd+K) • e.g. "Open editor, create notes.txt, write memo"...'
          }
          disabled={isRunning}
          className="flex-1 bg-transparent text-white font-sans text-xs px-2.5 py-1.5 outline-none placeholder-white/35 font-normal"
        />

        {/* Global Shortcut Hint (Cmd+K) */}
        {!command && !isRunning && !isRecording && (
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-white/30 font-mono pr-2">
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">⌘K</span>
          </div>
        )}

        {/* Voice Activity Indicator */}
        {isRecording && (
          <div className="flex items-center gap-0.5 px-2 select-none">
            <div className="w-1 h-3 bg-[#D71920] voice-bar rounded-full" />
            <div className="w-1 h-5 bg-[#D71920] voice-bar rounded-full" />
            <div className="w-1 h-2 bg-[#D71920] voice-bar rounded-full" />
            <div className="w-1 h-4 bg-[#D71920] voice-bar rounded-full" />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1.5 pr-1">
          {/* Microphone Button with Nothing Red Pulse */}
          <button
            onClick={toggleRecording}
            disabled={isRunning}
            title={isRecording ? 'Stop listening' : 'Dictate natural language command'}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              isRecording
                ? 'bg-[#D71920] text-white animate-pulse shadow-[0_0_12px_rgba(215,25,32,0.8)]'
                : 'text-white/60 hover:text-white hover:bg-white/10 active:scale-95'
            }`}
          >
            <Mic size={14} />
          </button>

          {/* Send / Execute Button */}
          <button
            ref={arrowRef}
            onClick={handleSend}
            disabled={!command.trim() || isRunning}
            title="Execute instruction (Enter)"
            className={`p-2 rounded-full transition-all cursor-pointer ${
              command.trim() && !isRunning
                ? 'bg-white text-black hover:bg-white/90 active:scale-95 shadow-md'
                : 'text-white/20 bg-white/5 cursor-not-allowed'
            }`}
          >
            {isRunning ? (
              <Sparkles size={14} className="animate-spin text-[#D71920]" />
            ) : (
              <ArrowUp size={14} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
