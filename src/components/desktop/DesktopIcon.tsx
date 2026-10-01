'use client'

import React, { useState, useRef } from 'react'
import gsap from 'gsap'

interface DesktopIconProps {
  icon: React.ReactNode
  label: string
  onDoubleClick: () => void
}

export function DesktopIcon({ icon, label, onDoubleClick }: DesktopIconProps) {
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
      <div className={`p-2 rounded-sm border ${
        selected ? 'bg-[#111111]/10 border-[#111111]' : 'border-transparent hover:bg-[#111111]/5'
      }`}>
        <div className="text-[#111111]">
          {icon}
        </div>
      </div>
      <div className={`text-[11px] text-center font-sans px-1.5 py-0.5 truncate w-full select-none ${
        selected ? 'bg-[#111111] text-[#FFFFFF]' : 'text-[#111111] drop-shadow-sm'
      }`}>
        {label}
      </div>
    </div>
  )
}
