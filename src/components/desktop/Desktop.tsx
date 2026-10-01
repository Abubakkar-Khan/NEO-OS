'use client'

import { useState } from 'react'
import { Folder, FileText, Globe, Settings as SettingsIcon } from 'lucide-react'
import { useDesktopStore } from '@/stores/desktop-store'
import { DesktopIcon } from './DesktopIcon'
import { WindowManager } from './WindowManager'
import { Taskbar } from './Taskbar'
import { CommandInput } from './CommandInput'
import { Harness } from '@/components/harness/Harness'

export function Desktop() {
  const [view, setView] = useState<'desktop' | 'harness'>('desktop')
  const { openApp } = useDesktopStore()

  if (view === 'harness') {
    return (
      <div className="h-screen w-screen flex flex-col bg-[#111111] overflow-hidden">
        <div className="flex-1 overflow-hidden relative">
          <Harness />
        </div>
        <div className="bg-[#0A0A0A] px-4 py-2 border-t border-[#333333] flex justify-center shrink-0">
          <div className="w-full max-w-3xl">
            <CommandInput />
          </div>
        </div>
        <Taskbar view={view} onViewChange={setView} />
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F5F5F2] overflow-hidden relative font-sans">
      <div className="flex-1 relative bg-desktop-pattern flex p-4">
        {/* Desktop Shortcuts */}
        <div className="flex flex-col gap-3 z-10">
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
