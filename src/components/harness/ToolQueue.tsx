'use client';

import React from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { ListTree, Clock, Play, Check, X } from 'lucide-react';

export const ToolQueue: React.FC = () => {
  const { parsedToolCalls } = useHarnessStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={12} className="text-[#888888]" />;
      case 'running': return <Play size={12} className="text-[#D9D9D9] animate-pulse" />;
      case 'success': return <Check size={12} className="text-[#FFFFFF]" />;
      case 'failed': return <X size={12} className="text-[#FF4444]" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-[#888888]';
      case 'running': return 'text-[#D9D9D9]';
      case 'success': return 'text-[#FFFFFF]';
      case 'failed': return 'text-[#FF4444]';
      default: return 'text-[#888888]';
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#111111] overflow-hidden">
      <div className="flex items-center gap-2 p-2 border-b border-[#333333] bg-[#000000] text-[#888888] text-xs font-bold tracking-wider shrink-0">
        <ListTree size={14} />
        <h2>TOOL QUEUE</h2>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {parsedToolCalls.length === 0 ? (
          <div className="text-[#333333] h-full flex items-center justify-center italic">—</div>
        ) : (
          parsedToolCalls.map((tool, idx) => (
            <div key={tool.id} className={`flex gap-3 text-xs ${getStatusColor(tool.status)}`}>
              <div className="font-bold opacity-50 shrink-0">
                {(idx + 1).toString().padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{tool.name}</span>
                  {getStatusIcon(tool.status)}
                </div>
                {Object.entries(tool.arguments).slice(0, 2).map(([k, v]) => (
                  <div key={k} className="truncate opacity-75">
                    {k}: {String(v)}
                  </div>
                ))}
                {Object.keys(tool.arguments).length > 2 && (
                  <div className="opacity-50">...</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
