'use client';

import { useState, useEffect } from 'react';
import { Monitor, FileText, Globe, Settings as SettingsIcon } from 'lucide-react';
import { useDesktopStore } from '@/stores/desktop-store';
import { DesktopIcon } from './DesktopIcon';
import { WindowManager } from './WindowManager';
import { Taskbar } from './Taskbar';
import { CommandInput } from './CommandInput';
import { Mascot } from './Mascot';
import { Harness } from '@/components/harness/Harness';
import { backendClient } from '@/services/api-client';

export function Desktop() {
  const [view, setView] = useState<'desktop' | 'harness'>('desktop');
  const { openApp } = useDesktopStore();

  useEffect(() => {
    // Connect to FastAPI backend & WebSocket sync
    backendClient.init();

    const handleToggle = () => {
      setView(v => v === 'desktop' ? 'harness' : 'desktop');
    };
    window.addEventListener('needleos:toggle-view', handleToggle);
    return () => window.removeEventListener('needleos:toggle-view', handleToggle);
  }, []);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (e.target === e.currentTarget || target.classList.contains('desktop-surface-area')) {
      window.dispatchEvent(new CustomEvent('needleos:focus-input'));
    }
  };

  if (view === 'harness') {
    return (
      <div className="h-screen w-screen flex flex-col bg-[#0B0D0E] overflow-hidden relative font-sans">
        <div className="flex-1 overflow-hidden relative">
          <Harness />
        </div>
        <div className="bg-[#101214] px-4 py-2 border-t border-white/10 flex justify-center shrink-0 z-30">
          <div className="w-full max-w-2xl">
            <CommandInput />
          </div>
        </div>
        <Mascot />
        <Taskbar view={view} onViewChange={setView} />
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-screen flex flex-col bg-nothing-canvas overflow-hidden relative font-sans select-none"
      onClick={handleBackgroundClick}
    >
      {/* Nothing OS Utilitarian Surface */}
      <div 
        className="flex-1 relative flex p-6 desktop-surface-area"
        onClick={handleBackgroundClick}
      >
        {/* Desktop Shortcuts: z-[1] so open windows (z-20+) float strictly above them */}
        <div className="flex flex-col gap-3 relative z-[1] pointer-events-auto">
          <DesktopIcon 
            icon={<Monitor size={26} strokeWidth={1.75} />} 
            label="Computer" 
            onDoubleClick={() => openApp('file-manager', 'Computer')} 
          />
          <DesktopIcon 
            icon={<FileText size={26} strokeWidth={1.75} />} 
            label="Editor" 
            onDoubleClick={() => openApp('text-editor')} 
          />
          <DesktopIcon 
            icon={<Globe size={26} strokeWidth={1.75} />} 
            label="Browser" 
            onDoubleClick={() => openApp('browser')} 
          />
          <DesktopIcon 
            icon={<SettingsIcon size={26} strokeWidth={1.75} />} 
            label="Settings" 
            onDoubleClick={() => openApp('settings')} 
          />
        </div>

        {/* Windows Layer */}
        <WindowManager />
      </div>

      {/* Needle 3 Interactive Mascot with Eye Tracking */}
      <Mascot />

      {/* Floating Spotlight Command Bar (Above Taskbar) */}
      <div className="absolute bottom-14 left-0 w-full px-4 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl">
          <CommandInput />
        </div>
      </div>

      {/* Floating Nothing OS Dock / Taskbar */}
      <Taskbar view={view} onViewChange={setView} />
    </div>
  );
}
