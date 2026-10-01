'use client'

import { useState, useEffect } from 'react'
import { Folder, FileText, Globe, Settings as SettingsIcon } from 'lucide-react'
import { useDesktopStore } from '@/stores/desktop-store'
import { DesktopIcon } from './DesktopIcon'
import { WindowManager } from './WindowManager'
import { Taskbar } from './Taskbar'
import { CommandInput } from './CommandInput'
import { Mascot } from './Mascot'
import { Harness } from '@/components/harness/Harness'
import { backendClient } from '@/services/api-client'

export function Desktop() {
  const [view, setView] = useState<'desktop' | 'harness'>('desktop')
  const { openApp } = useDesktopStore()

  useEffect(() => {
    // Connect to FastAPI backend & WebSocket sync
    backendClient.init()
  }, [])

  const handleBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (e.target === e.currentTarget || target.classList.contains('desktop-surface-area')) {
      window.dispatchEvent(new CustomEvent('needleos:focus-input'))
    }
  }

  if (view === 'harness') {
    return (
      <div className="h-screen w-screen flex flex-col bg-[#111111] overflow-hidden relative">
        <div className="flex-1 overflow-hidden relative">
          <Harness />
        </div>
        <div className="bg-[#0A0A0A] px-4 py-2 border-t border-[#2A2A2A] flex justify-center shrink-0 z-30">
          <div className="w-full max-w-3xl">
            <CommandInput />
          </div>
        </div>
        <Mascot />
        <Taskbar view={view} onViewChange={setView} />
      </div>
    )
  }

  return (
    <div 
      className="h-screen w-screen flex flex-col bg-[#F8F9FA] overflow-hidden relative font-sans select-none"
      onClick={handleBackgroundClick}
    >
      {/* 60% Dominant Swiss Minimal Surface with subtle architectural dot grid */}
      <div 
        className="flex-1 relative bg-desktop-pattern flex p-4 desktop-surface-area"
        onClick={handleBackgroundClick}
      >
        {/* Desktop Shortcuts: z-[1] so all open windows (z-20+) float strictly above them */}
        <div className="flex flex-col gap-3 relative z-[1] pointer-events-auto">
          <DesktopIcon 
            icon={<Folder size={30} strokeWidth={1.5} />} 
            label="Files" 
            onDoubleClick={() => openApp('file-manager')} 
          />
          <DesktopIcon 
            icon={<FileText size={30} strokeWidth={1.5} />} 
            label="Editor" 
            onDoubleClick={() => openApp('text-editor')} 
          />
          <DesktopIcon 
            icon={<Globe size={30} strokeWidth={1.5} />} 
            label="Browser" 
            onDoubleClick={() => openApp('browser')} 
          />
          <DesktopIcon 
            icon={<SettingsIcon size={30} strokeWidth={1.5} />} 
            label="Settings" 
            onDoubleClick={() => openApp('settings')} 
          />
        </div>

        {/* Windows Layer */}
        <WindowManager />
      </div>

      {/* Needle Circular Mascot */}
      <Mascot />

      {/* Floating Command Bar */}
      <div className="absolute bottom-12 left-0 w-full px-4 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl">
          <CommandInput />
        </div>
      </div>

      {/* Taskbar */}
      <Taskbar view={view} onViewChange={setView} />
    </div>
  )
}
