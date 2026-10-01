'use client';

import React from 'react';
import { useDesktopStore } from '@/stores/desktop-store';
import { Server } from 'lucide-react';

export const OSStateSnapshot: React.FC = () => {
  const { openWindows, activeWindowId, filesystem, editor, browser } = useDesktopStore();

  const fileCount = filesystem.filter(n => n.type === 'file').length;
  const folderCount = filesystem.filter(n => n.type === 'folder' && n.parentId !== null).length;
  
  const activeWindow = openWindows.find(w => w.id === activeWindowId && !w.minimized);
  const openEditorNode = editor.openFile ? filesystem.find(n => n.id === editor.openFile) : null;

  return (
    <div className="flex flex-col shrink-0 border-b border-[#333333] bg-[#111111] select-none">
      <div className="flex items-center gap-2 p-2 border-b border-[#333333] bg-[#000000] text-[#888888] text-xs font-bold tracking-wider">
        <Server size={14} />
        <h2>OS STATE SNAPSHOT</h2>
      </div>
      <div className="p-3 text-xs grid grid-cols-[120px_1fr] gap-y-2 font-mono">
        <div className="text-[#888888]">Active App:</div>
        <div className="text-[#FFFFFF] font-bold truncate">
          {activeWindow ? `${activeWindow.title} (${activeWindow.appId})` : '— (Desktop)'}
        </div>

        <div className="text-[#888888]">Open Windows:</div>
        <div className="text-[#D9D9D9] truncate">
          {openWindows.length > 0 
            ? openWindows.map(w => `${w.title}${w.minimized ? ' [min]' : ''}`).join(', ') 
            : 'None'}
        </div>

        <div className="text-[#888888]">Editor File:</div>
        <div className="text-[#D9D9D9] truncate">
          {openEditorNode ? `${openEditorNode.name} (${editor.content.length} chars)` : (editor.content ? 'Untitled Note' : '—')}
        </div>

        <div className="text-[#888888]">Editor Status:</div>
        <div className="text-[#D9D9D9]">
          {editor.dirty ? '● Unsaved changes' : '✓ Clean / Saved'}
        </div>

        <div className="text-[#888888]">Browser URL:</div>
        <div className="text-[#D9D9D9] truncate">
          {browser.url || '—'}
        </div>

        <div className="text-[#888888]">Virtual FS:</div>
        <div className="text-[#D9D9D9]">
          {fileCount} files, {folderCount} folders
        </div>
      </div>
    </div>
  );
};
