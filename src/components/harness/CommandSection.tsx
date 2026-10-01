'use client';

import React from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { Terminal } from 'lucide-react';

export const CommandSection: React.FC = () => {
  const { currentCommand } = useHarnessStore();

  return (
    <div className="flex flex-col border-b border-[#333333] bg-[#111111] p-3 shrink-0">
      <div className="flex items-center gap-2 mb-2 text-[#888888] text-xs font-bold tracking-wider">
        <Terminal size={14} />
        <h2>COMMAND</h2>
      </div>
      <div className="bg-[#000000] border border-[#333333] p-3 min-h-[60px] text-[#FFFFFF] whitespace-pre-wrap break-words">
        {currentCommand || <span className="text-[#333333]">Waiting for command...</span>}
      </div>
    </div>
  );
};
