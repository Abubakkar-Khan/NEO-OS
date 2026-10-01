'use client';

import React from 'react';
import { useDesktopStore } from '@/stores/desktop-store';
import { Server, HardDrive, Cpu, Radio, Shield } from 'lucide-react';

export const OSStateSnapshot: React.FC = () => {
  const { openWindows, activeWindowId, filesystem, editor, browser, settings } = useDesktopStore();

  const fileCount = filesystem.filter(n => n.type === 'file').length;
  const folderCount = filesystem.filter(n => n.type === 'folder' && n.parentId !== null).length;
  
  const activeWindow = openWindows.find(w => w.id === activeWindowId && !w.minimized);
  const openEditorNode = editor.openFile ? filesystem.find(n => n.id === editor.openFile) : null;

  return (
    <div className="flex flex-col shrink-0 border-b border-[#1E252D] bg-[#0E1216] select-none text-xs font-mono">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E252D] bg-[#090C0E] text-[#7E8F9F] font-bold text-[11px] tracking-wider">
        <div className="flex items-center gap-2">
          <Server size={13} className="text-[#10A37F]" />
          <span className="text-[#FFFFFF]">TELEMETRY &bull; VIRTUAL OS STATE</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#10A37F]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10A37F] animate-pulse" />
          <span>SYNC 60Hz</span>
        </div>
      </div>

      {/* Grid of OS metrics */}
      <div className="p-3 grid grid-cols-2 gap-2 bg-[#0B0E11]">
        {/* Metric 1 */}
        <div className="p-2 bg-[#12171D] rounded border border-[#1E2630]">
          <div className="text-[10px] text-[#6E8090] flex items-center justify-between mb-1">
            <span>ACTIVE WINDOW</span>
            <Radio size={10} className="text-[#3B82F6]" />
          </div>
          <div className="text-[#FFFFFF] font-bold truncate">
            {activeWindow ? activeWindow.title : 'Desktop Surface'}
          </div>
          <div className="text-[10px] text-[#4E5E6E] truncate">
            App ID: {activeWindow ? activeWindow.appId : 'root_shell'}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-2 bg-[#12171D] rounded border border-[#1E2630]">
          <div className="text-[10px] text-[#6E8090] flex items-center justify-between mb-1">
            <span>OPEN PROCESSES</span>
            <Cpu size={10} className="text-[#10A37F]" />
          </div>
          <div className="text-[#FFFFFF] font-bold">
            {openWindows.length} Windows Active
          </div>
          <div className="text-[10px] text-[#4E5E6E] truncate">
            {openWindows.map(w => w.appId).join(', ') || 'No active apps'}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-2 bg-[#12171D] rounded border border-[#1E2630]">
          <div className="text-[10px] text-[#6E8090] flex items-center justify-between mb-1">
            <span>EDITOR BUFFER</span>
            <span className={`w-1.5 h-1.5 rounded-full ${editor.dirty ? 'bg-[#F59E0B]' : 'bg-[#10A37F]'}`} />
          </div>
          <div className="text-[#FFFFFF] font-bold truncate">
            {openEditorNode ? openEditorNode.name : (editor.content ? 'Untitled' : 'No buffer')}
          </div>
          <div className="text-[10px] text-[#4E5E6E]">
            {editor.content.length} bytes &bull; {editor.dirty ? 'Unsaved' : 'Clean'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-2 bg-[#12171D] rounded border border-[#1E2630]">
          <div className="text-[10px] text-[#6E8090] flex items-center justify-between mb-1">
            <span>VIRTUAL STORAGE</span>
            <HardDrive size={10} className="text-[#8B5CF6]" />
          </div>
          <div className="text-[#FFFFFF] font-bold">
            {fileCount} Files &bull; {folderCount} Folders
          </div>
          <div className="text-[10px] text-[#4E5E6E]">
            Root mount: / (In-Memory)
          </div>
        </div>
      </div>
    </div>
  );
};
