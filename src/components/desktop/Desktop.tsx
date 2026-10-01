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
import { CrtBackground } from '@/shaders/crt/CrtBackground'
import '@/shaders/threeui.css'

export function Desktop() {
  const [view, setView] = useState<'desktop' | 'harness'>('desktop')
  const { openApp, settings } = useDesktopStore()
  const isCrt = settings.crtTerminal

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
        <div className="bg-[#0A0A0A] px-4 py-2 border-t border-[#333333] flex justify-center shrink-0 z-30">
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
      className={`h-screen w-screen flex flex-col ${isCrt ? 'bg-[#03100a]' : 'bg-[#F5F5F2]'} overflow-hidden relative font-sans select-none`}
      onClick={handleBackgroundClick}
    >
      {/* Authored ThreeUI CRT Terminal WebGL + 2D Phosphor Background */}
      {isCrt && (
        <div className="shader-frame absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-95">
          <CrtBackground
            variant="terminal"
            speed={1.00}
            typeSpeed={1.00}
            motion={1.00}
            hue={0}
            saturation={1.00}
            brightness={1.00}
            opacity={1.00}
          />
        </div>
      )}

      {/* Main Desktop Workspace Area */}
      <div 
        className={`flex-1 relative ${isCrt ? 'bg-transparent' : 'bg-desktop-pattern'} flex p-4 desktop-surface-area`}
        onClick={handleBackgroundClick}
      >
        {/* Desktop Shortcuts: z-[1] so all open windows (z-20+) float strictly above them */}
        <div className="flex flex-col gap-3 relative z-[1] pointer-events-auto">
          <DesktopIcon 
            icon={<Folder size={30} strokeWidth={1.5} />} 
            label="Files" 
            isDark={isCrt}
            onDoubleClick={() => openApp('file-manager')} 
          />
          <DesktopIcon 
            icon={<FileText size={30} strokeWidth={1.5} />} 
            label="Editor" 
            isDark={isCrt}
            onDoubleClick={() => openApp('text-editor')} 
          />
          <DesktopIcon 
            icon={<Globe size={30} strokeWidth={1.5} />} 
            label="Browser" 
            isDark={isCrt}
            onDoubleClick={() => openApp('browser')} 
          />
          <DesktopIcon 
            icon={<SettingsIcon size={30} strokeWidth={1.5} />} 
            label="Settings" 
            isDark={isCrt}
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
