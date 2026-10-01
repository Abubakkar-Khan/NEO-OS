'use client';

import React, { useEffect, useRef } from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { AlignLeft } from 'lucide-react';
import gsap from 'gsap';

export const ExecutionTrace: React.FC = () => {
  const { parsedToolCalls } = useHarnessStore();
  const listRef = useRef<HTMLDivElement>(null);

  // GSAP: Animate new trace cards entering
  useEffect(() => {
    if (listRef.current) {
      const cards = listRef.current.querySelectorAll('.trace-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.22, stagger: 0.04, ease: 'power2.out' }
        );
      }
    }
  }, [parsedToolCalls.length]);

  return (
    <div className="flex flex-col h-full bg-[#111111] overflow-hidden">
      <div className="flex items-center gap-2 p-2 border-b border-[#333333] bg-[#000000] text-[#888888] text-xs font-bold tracking-wider shrink-0 select-none">
        <AlignLeft size={14} />
        <h2>EXECUTION TRACE</h2>
        <span className="text-[10px] text-[#666666] ml-auto">
          {parsedToolCalls.length} calls
        </span>
      </div>
      <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-4">
        {parsedToolCalls.length === 0 ? (
          <div className="text-[#333333] h-full flex flex-col items-center justify-center italic text-xs gap-2">
            <div>—</div>
            <div>Waiting for command execution trace...</div>
          </div>
        ) : (
          parsedToolCalls.map((tool) => {
            const isRunning = tool.status === 'running';
            const duration = tool.startTime && tool.endTime ? tool.endTime - tool.startTime : null;
            
            return (
              <div 
                key={tool.id} 
                className={`trace-card border ${
                  isRunning 
                    ? 'border-[#FFFFFF] shadow-[0_0_12px_rgba(255,255,255,0.2)]' 
                    : tool.status === 'failed'
                    ? 'border-[#FF4444]'
                    : 'border-[#333333]'
                } bg-[#000000] p-3 text-xs flex flex-col gap-2 transition-all`}
              >
                <div className="flex justify-between items-center pb-2 border-b border-[#333333]">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                      tool.status === 'pending' ? 'bg-[#333333] text-[#888888]' :
                      tool.status === 'running' ? 'bg-[#FFFFFF] text-[#000000] animate-pulse' :
                      tool.status === 'success' ? 'bg-[#FFFFFF] text-[#000000]' :
                      'bg-[#FF4444] text-[#FFFFFF]'
                    }`}>
                      {tool.status.toUpperCase()}
                    </span>
                    <span className="font-bold text-[#FFFFFF] font-mono">{tool.name}</span>
                  </div>
                  {duration !== null && (
                    <span className="text-[#888888] font-mono">{duration}ms</span>
                  )}
                </div>
                
                <div className="text-[#D9D9D9]">
                  <div className="text-[#888888] text-[10px] mb-1 font-bold">ARGUMENTS</div>
                  <pre className="bg-[#111111] p-2 border border-[#333333] overflow-x-auto text-[11px] font-mono">
                    {JSON.stringify(tool.arguments, null, 2)}
                  </pre>
                </div>

                {tool.result !== undefined && tool.result !== null && (
                  <div className="text-[#D9D9D9] mt-1">
                    <div className="text-[#888888] text-[10px] mb-1 font-bold">RESULT</div>
                    <pre className="bg-[#111111] p-2 border border-[#333333] overflow-x-auto whitespace-pre-wrap text-[11px] font-mono">
                      {typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result, null, 2)}
                    </pre>
                  </div>
                )}

                {Boolean(tool.error) && (
                  <div className="text-[#FF4444] mt-1">
                    <div className="mb-1 font-bold text-[10px]">ERROR</div>
                    <div className="bg-[#1a0000] p-2 border border-[#FF4444] overflow-x-auto text-[11px] font-mono">
                      {tool.error}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
