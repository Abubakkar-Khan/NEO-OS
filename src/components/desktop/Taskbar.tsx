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
  const { openWindows, activeWindowId, focusApp, minimizeApp, settings } = useDesktopStore()
  const { runStatus, activeAgent } = useHarnessStore()
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
      className="h-10 bg-[#111111] text-[#FFFFFF] flex items-center justify-between px-3 border-t border-[#262626] shrink-0 z-[100] font-sans text-xs select-none shadow-sm"
    >
      <div className="flex items-center gap-3 h-full">
        {/* Brand / Start Button */}
        <div className="font-bold px-2.5 py-1 bg-[#1A1A1A] border border-[#333333] hover:border-[#555555] rounded-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer">
          {/* ChatGPT-style colorful dot badge */}
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10A37F]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
          </div>
          <span className="tracking-tight text-[11px] font-mono">NeedleOS</span>
        </div>

        {/* Running Windows */}
        <div className="flex items-center gap-1.5 h-full py-1">
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
                className={`h-full px-3 border rounded-sm truncate max-w-[170px] flex items-center gap-2 transition-all text-left ${
                  isActive
                    ? 'bg-[#262626] border-[#4A4A4A] text-[#FFFFFF] shadow-inner font-semibold'
                    : win.minimized
                    ? 'bg-[#141414] border-transparent text-[#666666] hover:bg-[#1F1F1F]'
                    : 'bg-[#1A1A1A] border-transparent text-[#CCCCCC] hover:bg-[#2A2A2A]'
                }`}
                title={win.title}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#10A37F] shadow-[0_0_6px_#10A37F]' : 'bg-[#555555]'}`} />
                <span className="truncate text-[11px]">{win.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2.5 h-full py-1">
        {/* Active Multi-Agent Execution Badge */}
        {runStatus === 'running' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1A261F] border border-[#10A37F]/50 rounded-sm text-[#10A37F] text-[11px] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#10A37F] inline-block shadow-[0_0_8px_#10A37F]" />
            <span className="font-mono font-bold">{activeAgent ? activeAgent.toUpperCase() : 'AGENT ACTIVE'}</span>
          </div>
        )}

        {/* Screen Switcher */}
        <button
          onClick={handleToggleView}
          className="mode-toggle-btn h-full px-3 hover:bg-[#222222] active:bg-[#2A2A2A] border border-[#2E2E2E] rounded-sm flex items-center gap-1.5 font-medium transition-all text-[11px]"
        >
          <Layout size={12} className={view === 'harness' ? 'text-[#10A37F]' : 'text-[#888888]'} />
          <span>{view === 'desktop' ? 'Harness Graph' : 'Desktop Shell'}</span>
        </button>

        {/* System Clock */}
        <div className="px-2 py-1 flex items-center select-none font-mono text-xs text-[#A0A0A0] border-l border-[#262626] pl-3">
          {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  )
}
