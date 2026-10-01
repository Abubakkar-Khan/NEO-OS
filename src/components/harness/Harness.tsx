'use client';

import React from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { CommandSection } from './CommandSection';
import { ModelOutput } from './ModelOutput';
import { ToolQueue } from './ToolQueue';
import { ExecutionTrace } from './ExecutionTrace';
import { OSStateSnapshot } from './OSStateSnapshot';
import { EventLog } from './EventLog';
import { Activity, Circle } from 'lucide-react';

export const Harness: React.FC = () => {
  const { runStatus, currentRunId } = useHarnessStore();

  const getStatusColor = () => {
    switch (runStatus) {
      case 'running': return 'text-[#FFFFFF] fill-current animate-pulse';
      case 'completed': return 'text-[#D9D9D9] fill-current';
      case 'error': return 'text-[#FF4444] fill-current';
      default: return 'text-[#333333] fill-current';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-[#D9D9D9] font-mono text-sm overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#333333] bg-[#000000]">
        <div className="flex items-center gap-3">
          <Activity size={16} className="text-[#888888]" />
          <h1 className="font-bold tracking-widest text-[#FFFFFF]">NEEDLE HARNESS</h1>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#888888]">
            <span>RUN_ID:</span>
            <span className="text-[#D9D9D9]">{currentRunId || 'NONE'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle size={10} className={getStatusColor()} />
            <span className="uppercase tracking-wider">{runStatus}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
        {/* Left Column */}
        <div className="flex flex-col border-r border-[#333333] overflow-hidden">
          <CommandSection />
          <ModelOutput />
          <ToolQueue />
        </div>

        {/* Center Column */}
        <div className="flex flex-col border-r border-[#333333] overflow-hidden">
          <ExecutionTrace />
        </div>

        {/* Right Column */}
        <div className="flex flex-col overflow-hidden">
          <OSStateSnapshot />
          <EventLog />
        </div>
      </div>
    </div>
  );
};
