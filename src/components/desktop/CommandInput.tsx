'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Mic, 
  ArrowUp, 
  Sparkles, 
  Monitor, 
  FileText, 
  Globe, 
  Settings as SettingsIcon, 
  Activity, 
  FilePlus, 
  FolderPlus, 
  Search, 
  Edit3, 
  Save, 
  Clock, 
  RotateCcw, 
  Trash2, 
  HelpCircle,
  Terminal
} from 'lucide-react';
import { agentRunner } from '@/agent/runner';
import { backendClient } from '@/services/api-client';
import { useDesktopStore } from '@/stores/desktop-store';
import { audioEngine } from '@/lib/audio';
import gsap from 'gsap';

interface SlashCommandDef {
  cmd: string;
  aliases?: string[];
  label: string;
  description: string;
  category: 'App' | 'Action' | 'System';
  icon: React.ReactNode;
  needsArg?: boolean;
  argPlaceholder?: string;
}

const SLASH_COMMANDS: SlashCommandDef[] = [
  {
    cmd: '/computer',
    aliases: ['/files', '/pc', '/filemanager'],
    label: 'Computer',
    description: 'Open Computer / File Manager',
    category: 'App',
    icon: <Monitor size={14} className="text-[#3B82F6]" />
  },
  {
    cmd: '/editor',
    aliases: ['/edit', '/notes'],
    label: 'Text Editor',
    description: 'Open text editor',
    category: 'App',
    icon: <FileText size={14} className="text-[#10B981]" />
  },
  {
    cmd: '/browser',
    aliases: ['/web'],
    label: 'Web Browser',
    description: 'Open browser [url/query]',
    category: 'App',
    icon: <Globe size={14} className="text-[#F59E0B]" />,
    needsArg: true,
    argPlaceholder: 'url or search query'
  },
  {
    cmd: '/settings',
    aliases: ['/config'],
    label: 'Settings',
    description: 'Open system settings',
    category: 'App',
    icon: <SettingsIcon size={14} className="text-[#8B5CF6]" />
  },
  {
    cmd: '/control',
    aliases: ['/harness', '/mission'],
    label: 'Control Room',
    description: 'Toggle Mission Control & Graph',
    category: 'App',
    icon: <Activity size={14} className="text-[#D71920]" />
  },
  {
    cmd: '/newfile',
    aliases: ['/touch'],
    label: 'New File',
    description: 'Create file: /newfile [filename]',
    category: 'Action',
    icon: <FilePlus size={14} className="text-[#10B981]" />,
    needsArg: true,
    argPlaceholder: 'notes.txt'
  },
  {
    cmd: '/newfolder',
    aliases: ['/mkdir'],
    label: 'New Folder',
    description: 'Create folder: /newfolder [dirname]',
    category: 'Action',
    icon: <FolderPlus size={14} className="text-[#3B82F6]" />,
    needsArg: true,
    argPlaceholder: 'Projects'
  },
  {
    cmd: '/search',
    aliases: ['/find'],
    label: 'Search Web',
    description: 'Fast web search: /search [query]',
    category: 'Action',
    icon: <Search size={14} className="text-[#F59E0B]" />,
    needsArg: true,
    argPlaceholder: 'Next.js 16'
  },
  {
    cmd: '/write',
    aliases: ['/type'],
    label: 'Insert Text',
    description: 'Write into editor: /write [text]',
    category: 'Action',
    icon: <Edit3 size={14} className="text-[#EC4899]" />,
    needsArg: true,
    argPlaceholder: 'Hello from NEO-OS'
  },
  {
    cmd: '/save',
    label: 'Save File',
    description: 'Save current editor file',
    category: 'Action',
    icon: <Save size={14} className="text-[#10B981]" />
  },
  {
    cmd: '/time',
    aliases: ['/clock'],
    label: 'System Time',
    description: 'Display current system time',
    category: 'System',
    icon: <Clock size={14} className="text-[#64748B]" />
  },
  {
    cmd: '/reset',
    label: 'Reset Desktop',
    description: 'Restore clean initial OS state',
    category: 'System',
    icon: <RotateCcw size={14} className="text-[#D71920]" />
  },
  {
    cmd: '/clear',
    aliases: ['/cls'],
    label: 'Clear History',
    description: 'Clear prompt input and terminal history',
    category: 'System',
    icon: <Trash2 size={14} className="text-[#64748B]" />
  },
  {
    cmd: '/help',
    label: 'Help / Commands',
    description: 'Show list of fast slash commands',
    category: 'System',
    icon: <HelpCircle size={14} className="text-[#3B82F6]" />
  }
];

const DEFAULT_INITIAL_HISTORY = [
  '/computer',
  '/editor',
  'Open the text editor, create a file called hello.txt, write Hello from Needle, save it, then open the browser and search for Next.js.',
  '/browser nextjs.org',
  'Create a folder called Projects',
  '/settings'
];

export function CommandInput() {
  const [command, setCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);
  
  // Terminal Command History State
  const [history, setHistory] = useState<string[]>(DEFAULT_INITIAL_HISTORY);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [draft, setDraft] = useState<string>('');

  const { settings, openApp, createFile, createFolder, setEditorContent, saveEditorFile, browserSearch, browserNavigate, resetDesktop } = useDesktopStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);
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

  // Filtered Slash Commands
  const filteredSlashCommands = useMemo(() => {
    if (!command.startsWith('/')) return [];
    const query = command.trim().toLowerCase();
    const token = query.split(' ')[0]; // only match command part
    
    return SLASH_COMMANDS.filter(sc => {
      if (sc.cmd.startsWith(token)) return true;
      if (sc.aliases?.some(a => a.startsWith(token))) return true;
      if (sc.label.toLowerCase().includes(token.replace('/', ''))) return true;
      return false;
    });
  }, [command]);

  useEffect(() => {
    if (command.startsWith('/') && !command.includes(' ') && filteredSlashCommands.length > 0) {
      setShowSlashMenu(true);
      setSlashIndex(0);
    } else {
      setShowSlashMenu(false);
    }
  }, [command, filteredSlashCommands.length]);

  // Live Planned Action Predictions for natural language
  const predictedActions = useMemo(() => {
    const text = command.trim().toLowerCase();
    if (text.startsWith('/') || text.length < 3) return [];

    const actions: { domain: string; action: string }[] = [];

    if (text.includes('computer') || text.includes('files') || text.includes('file manager')) {
      actions.push({ domain: 'Desktop', action: 'Open Computer' });
    }
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
            scaleY: () => gsap.utils.random(0.3, 1.8),
            stagger: 0.08,
            duration: 0.22,
            ease: 'sine.inOut'
          });
      }
    } else {
      if (waveTimelineRef.current) {
        waveTimelineRef.current.kill();
      }
    }
    return () => {
      if (waveTimelineRef.current) {
        waveTimelineRef.current.kill();
      }
    };
  }, [isRecording]);

  // ── Execute Fast Slash Command (<1ms direct execution) ──
  const executeSlashCommand = async (cmdDef: SlashCommandDef, rawArg?: string) => {
    const arg = rawArg?.trim() || '';
    if (settings.sound) audioEngine.playSuccess();

    setShowSlashMenu(false);
    setCommand('');

    switch (cmdDef.cmd) {
      case '/computer':
        openApp('file-manager', 'Computer');
        break;
      case '/editor':
        openApp('text-editor', 'Text Editor');
        break;
      case '/browser':
        openApp('browser', 'Browser');
        if (arg) {
          if (arg.includes('.') || arg.startsWith('http')) {
            browserNavigate(arg);
          } else {
            browserSearch(arg);
          }
        }
        break;
      case '/settings':
        openApp('settings', 'Settings');
        break;
      case '/control':
        window.dispatchEvent(new CustomEvent('needleos:toggle-view'));
        break;
      case '/newfile':
        const fname = arg || 'document.txt';
        createFile(fname, 'root', '');
        openApp('text-editor', fname);
        break;
      case '/newfolder':
        const dirname = arg || 'New Folder';
        createFolder(dirname, 'root');
        openApp('file-manager', 'Computer');
        break;
      case '/search':
        openApp('browser', 'Browser');
        browserSearch(arg || 'NeedleOS');
        break;
      case '/write':
        if (arg) {
          setEditorContent(arg);
          openApp('text-editor', 'Text Editor');
        }
        break;
      case '/save':
        saveEditorFile();
        break;
      case '/time':
        alert(`System Time: ${new Date().toLocaleTimeString()} (NEO-OS UTC Local)`);
        break;
      case '/reset':
        if (confirm('Reset virtual desktop to clean initial state?')) {
          resetDesktop();
        }
        break;
      case '/clear':
        setHistory([]);
        localStorage.removeItem('neo_os_cmd_history');
        setCommand('');
        break;
      case '/help':
        alert(`Available Fast Commands:\n${SLASH_COMMANDS.map(c => `${c.cmd} — ${c.description}`).join('\n')}`);
        break;
      default:
        break;
    }
  };

  const handleSelectSlash = (cmdDef: SlashCommandDef) => {
    if (cmdDef.needsArg) {
      setCommand(`${cmdDef.cmd} `);
      setShowSlashMenu(false);
      inputRef.current?.focus();
    } else {
      executeSlashCommand(cmdDef);
    }
  };

  const handleSend = async () => {
    const trimmed = command.trim();
    if (!trimmed || isRunning) return;

    // Fast Slash Command Check
    if (trimmed.startsWith('/')) {
      const parts = trimmed.split(/\s+/);
      const cmdToken = parts[0].toLowerCase();
      const arg = parts.slice(1).join(' ');

      const matched = SLASH_COMMANDS.find(sc => sc.cmd === cmdToken || sc.aliases?.includes(cmdToken));
      if (matched) {
        await executeSlashCommand(matched, arg);
        return;
      }
    }

    // Direct Natural Language "Computer" Match (<1ms)
    if (/^(open\s+)?(my\s+)?(the\s+)?computer$/i.test(trimmed)) {
      if (settings.sound) audioEngine.playSuccess();
      openApp('file-manager', 'Computer');
      setCommand('');
      return;
    }

    setIsRunning(true);
    if (settings.sound) audioEngine.playClick();

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
        console.warn('Backend connection issue, running local runner:', err);
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
    // Slash Menu Navigation
    if (showSlashMenu && filteredSlashCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashIndex(i => (i + 1) % filteredSlashCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashIndex(i => (i - 1 + filteredSlashCommands.length) % filteredSlashCommands.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectSlash(filteredSlashCommands[slashIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
        return;
      }
    }

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
    if (isRunning) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        if (settings.sound) audioEngine.playPop();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCommand(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center relative select-none">
      {/* ─── Fast Slash Commands Autocomplete Menu ─── */}
      {showSlashMenu && filteredSlashCommands.length > 0 && (
        <div 
          ref={slashMenuRef}
          className="absolute bottom-14 w-full max-w-md bg-[#181A1D]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 max-h-64 overflow-y-auto divide-y divide-white/5 font-sans"
        >
          <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-white/40 uppercase tracking-wider">
            <span>Fast Commands</span>
            <span>Tab / ↵ to Run</span>
          </div>
          {filteredSlashCommands.map((cmdDef, idx) => {
            const isSelected = idx === slashIndex;
            return (
              <div
                key={cmdDef.cmd}
                onClick={() => handleSelectSlash(cmdDef)}
                onMouseEnter={() => setSlashIndex(idx)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${
                  isSelected ? 'bg-white/15 text-white shadow-xs' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    {cmdDef.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs font-semibold text-white">
                      <span>{cmdDef.cmd}</span>
                      {cmdDef.needsArg && (
                        <span className="text-[10px] text-white/40 font-normal">[{cmdDef.argPlaceholder}]</span>
                      )}
                    </div>
                    <div className="text-[11px] text-white/50">{cmdDef.description}</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                  {cmdDef.category}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Live Planned Action Predictions (Chips) ─── */}
      {!showSlashMenu && predictedActions.length > 0 && (
        <div className="mb-2 flex items-center gap-1.5 max-w-2xl px-2 overflow-x-auto select-none animate-in fade-in duration-200">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#777772] px-2 py-0.5 rounded-full bg-white/80 border border-[#E0E0DA] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
            <span>Fast Plan</span>
          </div>
          {predictedActions.map((act, i) => (
            <div 
              key={i} 
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 border border-[#E0E0DA] text-[11px] font-mono text-[#222222] shadow-2xs shrink-0"
            >
              <span className="text-[#888882] text-[10px]">{act.domain}:</span>
              <span className="font-semibold">{act.action}</span>
            </div>
          ))}
        </div>
      )}

      {/* ─── Nothing OS Floating Command Bar ─── */}
      <div 
        ref={containerRef}
        className={`w-full bg-[#181A1D]/90 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1.5 flex items-center shadow-2xl transition-all duration-200 focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/10 ${
          isRunning ? 'ring-2 ring-[#D71920]/40' : ''
        }`}
      >
        {/* Needle 3 Core Badge with Nothing Red Dot */}
        <div className="flex items-center gap-1.5 pl-3 pr-2 border-r border-white/10 select-none">
          <span className={`w-2 h-2 rounded-full transition-all ${
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
              ? 'Executing action with Needle 3...' 
              : isRecording 
              ? 'Listening to speech...' 
              : 'Type "/" for fast commands or natural prompt (e.g. /computer, /editor)...'
          }
          disabled={isRunning}
          className="flex-1 bg-transparent text-white font-sans text-xs px-2.5 py-1.5 outline-none placeholder-white/35 font-normal"
        />

        {/* Global Shortcut Hint (Cmd+K) */}
        {!command && !isRunning && !isRecording && (
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-white/30 font-mono pr-2">
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">/ or ⌘K</span>
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
