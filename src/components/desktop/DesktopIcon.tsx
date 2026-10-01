'use client'

import React, { useState, useRef } from 'react'
import gsap from 'gsap'

interface DesktopIconProps {
  icon: React.ReactNode
  label: string
  onDoubleClick: () => void
  isDark?: boolean
}

export function DesktopIcon({ icon, label, onDoubleClick, isDark = false }: DesktopIconProps) {
  const [selected, setSelected] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (iconRef.current) {
      gsap.to(iconRef.current, { scale: 1.08, duration: 0.15, ease: 'power1.out' })
    }
  }

  const handleMouseLeave = () => {
    if (iconRef.current) {
      gsap.to(iconRef.current, { scale: 1, duration: 0.15, ease: 'power1.out' })
    }
  }

  const handleDoubleClick = () => {
    if (iconRef.current) {
      gsap.timeline()
        .to(iconRef.current, { scale: 0.88, duration: 0.08 })
        .to(iconRef.current, { scale: 1.1, duration: 0.12 })
        .to(iconRef.current, { scale: 1, duration: 0.1, onComplete: onDoubleClick })
    } else {
      onDoubleClick()
    }
  }

  return (
    <div
      ref={iconRef}
      className="w-20 h-20 flex flex-col items-center justify-center gap-1 cursor-pointer outline-none select-none transition-transform"
      onClick={(e) => {
        e.stopPropagation();
        setSelected(true);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={() => setSelected(false)}
      onDoubleClick={handleDoubleClick}
      tabIndex={0}
    >
      <div className={`p-2 rounded-sm border transition-colors ${
        selected 
          ? isDark ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300' : 'bg-[#111111]/10 border-[#111111]' 
          : isDark 
          ? 'border-emerald-500/20 bg-black/40 hover:bg-black/60 hover:border-emerald-400/40 text-emerald-300 backdrop-blur-xs' 
          : 'border-transparent hover:bg-[#111111]/5 text-[#111111]'
      }`}>
        <div className={isDark ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(40,240,140,0.5)]' : 'text-[#111111]'}>
          {icon}
        </div>
      </div>
      <div className={`text-[11px] text-center font-sans px-1.5 py-0.5 truncate w-full select-none rounded-xs ${
        selected 
          ? 'bg-[#111111] text-[#FFFFFF]' 
          : isDark 
          ? 'text-emerald-100/90 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] bg-black/40' 
          : 'text-[#111111] drop-shadow-sm'
      }`}>
        {label}
      </div>
    </div>
  )
}
