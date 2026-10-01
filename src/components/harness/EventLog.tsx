'use client';

import React, { useEffect, useRef } from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { ScrollText } from 'lucide-react';

export const EventLog: React.FC = () => {
  const { events } = useHarnessStore();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  const formatTime = (ts: number, startTs?: number) => {
    const d = new Date(ts);
    const ms = d.getMilliseconds().toString().padStart(3, '0');
    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${ms}`;
    return time;
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'USER_INPUT': return 'text-[#D9D9D9]';
      case 'MODEL_CALL': return 'text-[#888888]';
      case 'TOOL_SELECTED': return 'text-[#D9D9D9]';
      case 'TOOL_VALIDATED': return 'text-[#888888]';
      case 'TOOL_STARTED': return 'text-[#D9D9D9]';
      case 'TOOL_COMPLETED': return 'text-[#FFFFFF] font-bold';
      case 'TOOL_FAILED': return 'text-[#FF4444]';
      case 'SYSTEM_ERROR': return 'text-[#FF4444] font-bold';
      default: return 'text-[#888888]';
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#000000] overflow-hidden">
      <div className="flex items-center gap-2 p-2 border-b border-[#333333] bg-[#000000] text-[#888888] text-xs font-bold tracking-wider shrink-0">
        <ScrollText size={14} />
        <h2>EVENT LOG</h2>
      </div>
      <div 
        ref={logRef}
        className="flex-1 overflow-auto p-3 text-[10px] leading-tight space-y-1"
      >
        {events.length === 0 ? (
          <div className="text-[#333333] h-full flex items-center justify-center italic">—</div>
        ) : (
          events.map((evt, i) => (
            <div key={`${evt.timestamp}-${i}`} className="flex gap-2 hover:bg-[#111111]">
              <div className="text-[#333333] shrink-0">
                [{formatTime(evt.timestamp)}]
              </div>
              <div className={`shrink-0 w-28 ${getEventColor(evt.type)}`}>
                {evt.type}
              </div>
              <div className="text-[#888888] shrink-0 w-24 truncate">
                {evt.tool || ''}
              </div>
              <div className="text-[#D9D9D9] flex-1 truncate">
                {evt.message || (evt.args ? JSON.stringify(evt.args) : '')}
                {evt.error ? <span className="text-[#FF4444] ml-2">{evt.error}</span> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
