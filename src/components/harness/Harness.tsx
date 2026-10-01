'use client';

import React from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { AgentExecutionGraph } from './AgentExecutionGraph';
import { CommandSection } from './CommandSection';
import { ModelOutput } from './ModelOutput';
import { ToolQueue } from './ToolQueue';
import { ExecutionTrace } from './ExecutionTrace';
import { OSStateSnapshot } from './OSStateSnapshot';
import { EventLog } from './EventLog';
import { Activity, Circle, Layers } from 'lucide-react';

export const Harness: React.FC = () => {
  const { runStatus, currentRunId, activeAgent } = useHarnessStore();

  const getStatusColor = () => {
    switch (runStatus) {
      case 'running': return 'text-[#10A37F] fill-current animate-pulse';
      case 'completed': return 'text-[#10A37F] fill-current';
      case 'error': return 'text-[#FF4444] fill-current';
      default: return 'text-[#444444] fill-current';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-[#D9D9D9] font-mono text-sm overflow-hidden select-none">
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#262626] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10A37F]" />
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
          </div>
          <h1 className="font-bold tracking-widest text-[#FFFFFF] text-xs">NEO-OS HARNESS</h1>
          <span className="text-[10px] bg-[#1A1A1A] border border-[#333333] px-2 py-0.5 rounded text-[#888888]">
            Multi-Agent Pipeline
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#888888]">
            <span>ACTIVE:</span>
            <span className="text-[#10A37F] font-bold">{activeAgent ? activeAgent.toUpperCase() : 'NONE'}</span>
          </div>
          <div className="flex items-center gap-2 text-[#888888]">
            <span>RUN_ID:</span>
            <span className="text-[#D9D9D9]">{currentRunId || 'NONE'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle size={8} className={getStatusColor()} />
            <span className="uppercase tracking-wider text-[11px] font-bold">{runStatus}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
        {/* Column 1: Agent Execution Graph & Command */}
        <div className="flex flex-col border-r border-[#262626] overflow-hidden bg-[#0D0D0D]">
          <CommandSection />
          <div className="flex-1 overflow-hidden flex flex-col">
            <AgentExecutionGraph />
          </div>
        </div>

        {/* Column 2: Tool Execution Trace & Queues */}
        <div className="flex flex-col border-r border-[#262626] overflow-hidden bg-[#111111]">
          <ToolQueue />
          <div className="flex-1 overflow-hidden">
            <ExecutionTrace />
          </div>
        </div>

        {/* Column 3: OS State Snapshot & Chronological Event Log */}
        <div className="flex flex-col overflow-hidden bg-[#0D0D0D]">
          <OSStateSnapshot />
          <ModelOutput />
          <div className="flex-1 overflow-hidden">
            <EventLog />
          </div>
        </div>
      </div>
    </div>
  );
};
