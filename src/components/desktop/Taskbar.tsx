'use client'

import { useState, useEffect, useRef } from 'react'
import { useDesktopStore } from '@/stores/desktop-store'
import { useHarnessStore } from '@/stores/harness-store'
import { Cpu, Layout, Monitor } from 'lucide-react'
import gsap from 'gsap'

interface TaskbarProps {
  view: 'desktop' | 'harness'
  onViewChange: (view: 'desktop' | 'harness') => void
}

export function Taskbar({ view, onViewChange }: TaskbarProps) {
  const [time, setTime] = useState<Date | null>(null)
  const { openWindows, activeWindowId, focusApp, minimizeApp, settings, toggleCrtTerminal } = useDesktopStore()
  const { runStatus } = useHarnessStore()
  const taskbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTime(new Date())
    const interval = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const handleToggleView = () => {
    const nextView = view === 'desktop' ? 'harness' : 'desktop'
    if (settings.animations && taskbarRef.current) {
      gsap.fromTo(
        taskbarRef.current.querySelector('.mode-toggle-btn'),
        { scale: 0.95 },
        { scale: 1, duration: 0.2, ease: 'back.out(2)' }
      )
    }
    onViewChange(nextView)
  }

  return (
    <div 
      ref={taskbarRef}
      className="h-10 bg-[#111111] text-[#FFFFFF] flex items-center justify-between px-2 border-t border-[#333333] shrink-0 z-[100] font-sans text-xs select-none"
    >
      <div className="flex items-center gap-3 h-full">
        {/* Brand/Start Button */}
        <div className="font-bold px-2.5 py-1 bg-[#222222] border border-[#444444] rounded-sm flex items-center gap-1.5 shadow-sm">
          <div className="w-2 h-2 bg-[#FFFFFF]" />
          <span>NeedleOS</span>
        </div>

        {/* Running Windows */}
        <div className="flex items-center gap-1 h-full py-1">
          {openWindows.map((win) => {
            const isActive = activeWindowId === win.id && !win.minimized
            return (
              <button
                key={win.id}
                onClick={() => {
                  if (isActive) {
                    minimizeApp(win.id)
                  } else {
                    focusApp(win.id)
                  }
                }}
                className={`h-full px-3 border rounded-sm truncate max-w-[160px] flex items-center gap-1.5 transition-all text-left ${
                  isActive
                    ? 'bg-[#333333] border-[#888888] text-[#FFFFFF] shadow-inner font-semibold'
                    : win.minimized
                    ? 'bg-[#181818] border-transparent text-[#777777] hover:bg-[#252525]'
                    : 'bg-[#1e1e1e] border-transparent text-[#CCCCCC] hover:bg-[#333333]'
                }`}
                title={win.title}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#FFFFFF]' : 'bg-[#666666]'}`} />
                <span className="truncate">{win.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 h-full py-1">
        {/* Agent Activity Badge */}
        {runStatus === 'running' && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#222222] border border-[#555555] rounded-sm text-[#FFFFFF] text-[11px] animate-pulse">
            <Cpu size={12} className="text-[#FFFFFF]" />
            <span className="font-mono">AGENT ACTIVE</span>
          </div>
        )}

        {/* CRT Terminal Mode Toggle */}
        <button
          onClick={toggleCrtTerminal}
          className={`h-full px-2.5 border rounded-sm flex items-center gap-1.5 text-[11px] font-mono transition-all ${
            settings.crtTerminal
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(40,240,140,0.2)]'
              : 'bg-[#1e1e1e] border-[#333333] text-[#888888] hover:text-[#FFFFFF]'
          }`}
          title="Toggle ThreeUI CRT Terminal Background"
        >
          <Monitor size={12} className={settings.crtTerminal ? "text-emerald-400" : "text-[#888888]"} />
          <span className="hidden sm:inline">CRT {settings.crtTerminal ? 'ON' : 'OFF'}</span>
        </button>

        {/* Screen Switcher */}
        <button
          onClick={handleToggleView}
          className="mode-toggle-btn h-full px-3 hover:bg-[#2A2A2A] active:bg-[#333333] border border-[#333333] rounded-sm flex items-center gap-1.5 font-medium transition-all"
        >
          <Layout size={13} className="text-[#888888]" />
          <span>{view === 'desktop' ? 'Harness Mode' : 'Desktop Mode'}</span>
        </button>

        {/* System Clock */}
        <div className="px-2 py-1 flex items-center select-none font-mono text-xs text-[#D9D9D9]">
          {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  )
}
