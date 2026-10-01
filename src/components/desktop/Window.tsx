'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Minus, X, Square } from 'lucide-react'
import { useDesktopStore } from '@/stores/desktop-store'
import { AppWindow } from '@/lib/types'
import FileManager from '@/components/apps/FileManager'
import TextEditor from '@/components/apps/TextEditor'
import Browser from '@/components/apps/Browser'
import Settings from '@/components/apps/Settings'
import gsap from 'gsap'

export function Window({ window: win }: { window: AppWindow }) {
  const { closeApp, minimizeApp, focusApp, moveWindow, activeWindowId, settings } = useDesktopStore()
  const isActive = activeWindowId === win.id
  
  const windowRef = useRef<HTMLDivElement>(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // GSAP: Window entrance animation
  useEffect(() => {
    if (settings.animations && windowRef.current) {
      gsap.fromTo(
        windowRef.current,
        { scale: 0.94, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'power3.out' }
      );
    }
  }, [settings.animations]);

  // GSAP: Focus elevation transition
  useEffect(() => {
    if (settings.animations && windowRef.current) {
      if (isActive) {
        gsap.to(windowRef.current, {
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          borderColor: '#111111',
          duration: 0.2,
          ease: 'power2.out',
        });
      } else {
        gsap.to(windowRef.current, {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderColor: '#888888',
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    }
  }, [isActive, settings.animations]);

  const handlePointerDown = (e: React.PointerEvent) => {
    focusApp(win.id)
    if ((e.target as HTMLElement).closest('.window-controls')) return
    
    setIsDragging(true)
    const rect = windowRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const newX = Math.max(0, e.clientX - dragOffset.x)
    const newY = Math.max(0, e.clientY - dragOffset.y)
    moveWindow(win.id, { x: newX, y: newY })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  // GSAP: Animated Close
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (settings.animations && windowRef.current) {
      gsap.to(windowRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 12,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => closeApp(win.id),
      })
    } else {
      closeApp(win.id)
    }
  }

  // GSAP: Animated Minimize
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (settings.animations && windowRef.current) {
      gsap.to(windowRef.current, {
        scale: 0.75,
        opacity: 0,
        y: 80,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => minimizeApp(win.id),
      })
    } else {
      minimizeApp(win.id)
    }
  }

  const renderContent = () => {
    switch (win.appId) {
      case 'file-manager': return <FileManager />
      case 'text-editor': return <TextEditor />
      case 'browser': return <Browser />
      case 'settings': return <Settings />
      default: return <div className="p-4 text-[#888888]">Unknown Application</div>
    }
  }

  return (
    <div
      ref={windowRef}
      onMouseDown={() => focusApp(win.id)}
      className="absolute flex flex-col border border-[#333333] bg-[#F5F5F2] select-none"
      style={{
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
        minWidth: 320,
        minHeight: 220,
      }}
    >
      {/* Title Bar */}
      <div
        className={`h-8 flex items-center justify-between px-2 cursor-default select-none shrink-0 transition-colors ${
          isActive ? 'bg-[#111111] text-[#FFFFFF]' : 'bg-[#666666] text-[#D9D9D9]'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-2 font-sans text-xs font-semibold">
          <Square size={10} fill="currentColor" />
          <span className="truncate max-w-[400px]">{win.title}</span>
        </div>
        <div className="flex items-center gap-1 window-controls">
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-[#FFFFFF]/20 text-[#FFFFFF] rounded-sm transition-colors"
            title="Minimize"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-[#FF4444] text-[#FFFFFF] rounded-sm transition-colors"
            title="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative bg-[#FFFFFF]">
        {renderContent()}
      </div>
    </div>
  )
}
