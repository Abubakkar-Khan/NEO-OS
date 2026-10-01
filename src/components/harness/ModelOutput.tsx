'use client';

import React from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { Cpu } from 'lucide-react';

export const ModelOutput: React.FC = () => {
  const { parsedToolCalls, runStatus } = useHarnessStore();

  return (
    <div className="flex flex-col border-b border-[#333333] bg-[#111111] shrink-0 h-1/3 min-h-[200px]">
      <div className="flex items-center justify-between p-2 border-b border-[#333333] bg-[#000000]">
        <div className="flex items-center gap-2 text-[#888888] text-xs font-bold tracking-wider">
          <Cpu size={14} />
          <h2>MODEL OUTPUT</h2>
        </div>
        <div className="text-[10px] uppercase">
          {runStatus === 'idle' && <span className="text-[#333333]">IDLE</span>}
          {runStatus === 'running' && <span className="text-[#D9D9D9] animate-pulse">PROCESSING</span>}
          {(runStatus === 'completed' || runStatus === 'error') && <span className="text-[#888888]">COMPLETE</span>}
        </div>
      </div>
      <div className="flex-1 p-3 bg-[#111111] overflow-auto text-xs">
        {parsedToolCalls.length > 0 ? (
          <pre className="text-[#D9D9D9]">
            {JSON.stringify(parsedToolCalls.map(t => ({
              tool: t.name,
              args: t.arguments
            })), null, 2)}
          </pre>
        ) : (
          <div className="text-[#333333] h-full flex items-center justify-center italic">
            —
          </div>
        )}
      </div>
    </div>
  );
};
