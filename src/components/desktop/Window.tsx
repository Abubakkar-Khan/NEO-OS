'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Minus, X, Maximize2, Minimize2, Circle } from 'lucide-react';
import { useDesktopStore } from '@/stores/desktop-store';
import { AppWindow } from '@/lib/types';
import FileManager from '@/components/apps/FileManager';
import TextEditor from '@/components/apps/TextEditor';
import Browser from '@/components/apps/Browser';
import Settings from '@/components/apps/Settings';
import { audioEngine } from '@/lib/audio';
import gsap from 'gsap';

export function Window({ window: win }: { window: AppWindow }) {
  const { closeApp, minimizeApp, maximizeApp, focusApp, moveWindow, activeWindowId, settings } = useDesktopStore();
  const isActive = activeWindowId === win.id;
  
  const windowRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // GSAP: Window entrance animation
  useEffect(() => {
    if (settings.animations && windowRef.current) {
      gsap.fromTo(
        windowRef.current,
        { scale: 0.95, opacity: 0, y: 12 },
        { scale: 1, opacity: 1, y: 0, duration: 0.22, ease: 'power3.out' }
      );
    }
  }, [settings.animations]);

  const handlePointerDown = (e: React.PointerEvent) => {
    focusApp(win.id);
    if (settings.sound) {
      audioEngine.playPop();
    }
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    if (win.maximized) return;
    
    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || win.maximized) return;
    const newX = Math.max(0, e.clientX - dragOffset.x);
    const newY = Math.max(0, e.clientY - dragOffset.y);
    moveWindow(win.id, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // GSAP: Animated Close
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (settings.sound) audioEngine.playClick();
    if (settings.animations && windowRef.current) {
      gsap.to(windowRef.current, {
        scale: 0.92,
        opacity: 0,
        y: 8,
        duration: 0.16,
        ease: 'power2.in',
        onComplete: () => closeApp(win.id),
      });
    } else {
      closeApp(win.id);
    }
  };

  // GSAP: Animated Minimize
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (settings.sound) audioEngine.playClick();
    if (settings.animations && windowRef.current) {
      gsap.to(windowRef.current, {
        scale: 0.8,
        opacity: 0,
        y: 60,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => minimizeApp(win.id),
      });
    } else {
      minimizeApp(win.id);
    }
  };

  // Maximize / Restore
  const handleMaximize = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (settings.sound) audioEngine.playClick();
    maximizeApp(win.id);
  };

  const renderContent = () => {
    switch (win.appId) {
      case 'file-manager': return <FileManager />;
      case 'text-editor': return <TextEditor />;
      case 'browser': return <Browser />;
      case 'settings': return <Settings />;
      default: return <div className="p-4 text-[#888888]">Unknown Application</div>;
    }
  };

  return (
    <div
      ref={windowRef}
      onMouseDown={() => focusApp(win.id)}
      className={`absolute flex flex-col rounded-2xl overflow-hidden bg-[#FFFFFF] border select-none transition-[width,height,left,top] duration-150 ${
        isActive 
          ? 'border-[#111111]/25 window-elevation-active' 
          : 'border-[#111111]/10 window-elevation'
      }`}
      style={
        win.maximized
          ? {
              left: 8,
              top: 8,
              width: 'calc(100% - 16px)',
              height: 'calc(100% - 64px)',
              zIndex: win.zIndex + 25,
            }
          : {
              left: win.position.x,
              top: win.position.y,
              width: win.size.width,
              height: win.size.height,
              zIndex: win.zIndex + 20,
              minWidth: 340,
              minHeight: 240,
            }
      }
    >
      {/* Nothing OS Utilitarian Title Bar */}
      <div
        className={`h-9 flex items-center justify-between px-3.5 cursor-default select-none shrink-0 border-b transition-colors ${
          isActive 
            ? 'bg-[#181A1D] text-white border-white/10' 
            : 'bg-[#F2F2EE] text-[#555555] border-[#E2E2DC]'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={(e) => {
          if (!(e.target as HTMLElement).closest('.window-controls')) {
            handleMaximize(e as unknown as React.MouseEvent);
          }
        }}
      >
        {/* Title & Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={`w-1.5 h-1.5 rounded-full ${
            isActive ? 'bg-[#D71920]' : 'bg-[#999999]'
          }`} />
          <span className="font-dot text-[11px] tracking-wider truncate max-w-[360px]">
            {win.title}
          </span>
        </div>

        {/* Nothing OS Minimal Window Controls */}
        <div className="flex items-center gap-1.5 window-controls">
          <button
            onClick={handleMinimize}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isActive 
                ? 'hover:bg-white/15 text-white/70 hover:text-white' 
                : 'hover:bg-black/10 text-black/60 hover:text-black'
            }`}
            title="Minimize"
          >
            <Minus size={11} strokeWidth={2.5} />
          </button>

          <button
            onClick={handleMaximize}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isActive 
                ? 'hover:bg-white/15 text-white/70 hover:text-white' 
                : 'hover:bg-black/10 text-black/60 hover:text-black'
            }`}
            title={win.maximized ? "Restore" : "Maximize"}
          >
            {win.maximized ? (
              <Minimize2 size={10} strokeWidth={2.5} />
            ) : (
              <Maximize2 size={10} strokeWidth={2.5} />
            )}
          </button>

          <button
            onClick={handleClose}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#D71920] hover:text-white text-white/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative bg-[#FFFFFF]">
        {renderContent()}
      </div>
    </div>
  );
}
