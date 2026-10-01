'use client';

import React from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { Cpu, Brain, Gauge } from 'lucide-react';

export const ModelOutput: React.FC = () => {
  const { parsedToolCalls, runStatus, reasoning, confidence } = useHarnessStore();

  return (
    <div className="flex flex-col border-b border-[#333333] bg-[#111111] shrink-0 h-1/3 min-h-[220px]">
      <div className="flex items-center justify-between p-2 border-b border-[#333333] bg-[#000000]">
        <div className="flex items-center gap-2 text-[#888888] text-xs font-bold tracking-wider">
          <Cpu size={14} />
          <h2>NEEDLE 2 OUTPUT</h2>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {confidence !== null && confidence !== undefined && (
            <div className="flex items-center gap-1 text-[#CCCCCC] bg-[#222222] px-1.5 py-0.5 rounded-sm border border-[#444444]">
              <Gauge size={10} className="text-[#888888]" />
              <span>CONF: {(confidence * 100).toFixed(1)}%</span>
            </div>
          )}
          <div className="uppercase">
            {runStatus === 'idle' && <span className="text-[#333333]">IDLE</span>}
            {runStatus === 'running' && <span className="text-[#D9D9D9] animate-pulse">PROCESSING</span>}
            {(runStatus === 'completed' || runStatus === 'error') && <span className="text-[#FFFFFF] font-bold">READY</span>}
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 bg-[#111111] overflow-auto text-xs space-y-2">
        {/* Model Reasoning */}
        {reasoning && (
          <div className="bg-[#090909] border border-[#333333] p-2 rounded-sm mb-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#888888] uppercase mb-1">
              <Brain size={12} className="text-[#CCCCCC]" />
              <span>Model Reasoning</span>
            </div>
            <p className="text-[11px] text-[#D9D9D9] leading-relaxed italic">
              &ldquo;{reasoning}&rdquo;
            </p>
          </div>
        )}

        {/* Structured Output */}
        {parsedToolCalls.length > 0 ? (
          <div>
            <div className="text-[10px] text-[#666666] font-bold uppercase mb-1">Structured Tool Calls</div>
            <pre className="text-[#D9D9D9] font-mono text-[11px] bg-[#000000] p-2 border border-[#222222] overflow-x-auto">
              {JSON.stringify(
                parsedToolCalls.map((t) => ({
                  tool: t.name,
                  arguments: t.arguments,
                  status: t.status,
                })),
                null,
                2
              )}
            </pre>
          </div>
        ) : !reasoning ? (
          <div className="text-[#333333] h-full flex items-center justify-center italic text-xs">
            —
          </div>
        ) : null}
      </div>
    </div>
  );
};
