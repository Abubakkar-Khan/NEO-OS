'use client';

import React from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { 
  GitBranch, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  ShieldCheck, 
  FileText, 
  Folder, 
  Globe, 
  Settings as SettingsIcon,
  Monitor
} from 'lucide-react';

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  desktop: <Monitor size={13} className="text-[#3B82F6]" />,
  files: <Folder size={13} className="text-[#10A37F]" />,
  editor: <FileText size={13} className="text-[#F59E0B]" />,
  browser: <Globe size={13} className="text-[#8B5CF6]" />,
  system: <SettingsIcon size={13} className="text-[#EC4899]" />,
};

const DOMAIN_TOOLS: Record<string, string[]> = {
  desktop: ['open_app', 'close_app', 'focus_app', 'minimize_app', 'maximize_app'],
  files: ['list_files', 'create_file', 'create_folder', 'read_file', 'write_file', 'rename_file', 'rename_folder', 'move_file', 'delete_file'],
  editor: ['open_editor', 'insert_text', 'replace_text', 'save_file', 'save_as'],
  browser: ['open_browser', 'navigate', 'search', 'go_back'],
  system: ['get_time', 'get_system_info', 'change_setting', 'reset_desktop']
};

export const AgentExecutionGraph: React.FC = () => {
  const { workflow, handoffs, activeAgent, runStatus, toolQueue, confidence } = useHarnessStore();

  const getAgentStatus = (agentId: string) => {
    if (runStatus === 'idle') return 'IDLE';
    if (activeAgent === agentId && runStatus === 'running') return 'EXECUTING';
    
    // Check if tools for this agent have completed
    const agentDomain = agentId.replace('_agent', '');
    const agentTools = DOMAIN_TOOLS[agentDomain] || [];
    const calledTools = toolQueue.filter(t => agentTools.includes(t.name));
    
    if (calledTools.length > 0) {
      if (calledTools.every(t => t.status === 'success')) return 'COMPLETED';
      if (calledTools.some(t => t.status === 'failed')) return 'FAILED';
      if (calledTools.some(t => t.status === 'running')) return 'EXECUTING';
    }
    
    return 'STANDBY';
  };

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] border-b border-[#262626] text-xs font-mono select-none overflow-hidden">
      {/* Graph Header */}
      <div className="px-3 py-2 bg-[#141414] border-b border-[#222222] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch size={13} className="text-[#10A37F]" />
          <span className="font-bold text-[#FFFFFF] tracking-wider text-[11px]">MULTI-AGENT EXECUTION GRAPH</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-[#222222] border border-[#333333] text-[#A0A0A0] rounded">
            Needle 2 Hierarchical
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-[#777777]">Global Confidence:</span>
          <span className="font-bold text-[#10A37F]">
            {confidence ? `${(confidence * 100).toFixed(0)}%` : '95%'}
          </span>
        </div>
      </div>

      {/* Visual Execution Graph Tree */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {/* Level 0: Root Router Agent Node */}
        <div className="p-3 bg-[#161616] border border-[#2D2D2D] rounded-sm relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10A37F] shadow-[0_0_6px_#10A37F]" />
              <span className="font-bold text-[#FFFFFF] text-[12px]">ROOT ROUTER AGENT</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#1F2E24] text-[#10A37F] border border-[#10A37F]/30 rounded">
                Generation 2
              </span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
              activeAgent === 'root_router' && runStatus === 'running'
                ? 'bg-[#10A37F]/20 text-[#10A37F] border-[#10A37F]/40 animate-pulse'
                : 'bg-[#222222] text-[#888888] border-[#333333]'
            }`}>
              {activeAgent === 'root_router' && runStatus === 'running' ? 'ROUTING' : 'READY'}
            </span>
          </div>

          <div className="text-[11px] text-[#A0A0A0] mb-2 leading-relaxed">
            Classifies intent &amp; decomposes tasks into bounded domain actions. Does not execute file/DOM calls directly.
          </div>

          {/* Minimal 5 Routing Tools Boundary */}
          <div className="flex flex-wrap gap-1 mt-1">
            {['route_to_desktop', 'route_to_files', 'route_to_editor', 'route_to_browser', 'route_to_system'].map(r => (
              <span key={r} className="text-[10px] px-1.5 py-0.5 bg-[#1F1F1F] border border-[#333333] text-[#CCCCCC] rounded">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Level 1: Workflow Steps & Handoffs Connectors */}
        {workflow && workflow.steps && workflow.steps.length > 0 ? (
          <div className="space-y-2 relative pl-4 border-l-2 border-[#262626] ml-4">
            {workflow.steps.map((step, idx) => {
              const agentId = `${step.domain}_agent`;
              const status = getAgentStatus(agentId);
              const isCurrent = activeAgent === agentId;
              const domainTools = DOMAIN_TOOLS[step.domain] || [];

              return (
                <div 
                  key={step.id} 
                  className={`p-2.5 rounded-sm border transition-all ${
                    isCurrent && runStatus === 'running'
                      ? 'bg-[#18221D] border-[#10A37F] shadow-[0_0_12px_rgba(16,163,127,0.15)]'
                      : status === 'COMPLETED'
                      ? 'bg-[#161616] border-[#2A2A2A]'
                      : 'bg-[#141414] border-[#222222] opacity-80'
                  }`}
                >
                  {/* Step & Specialist Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-[#202020] rounded border border-[#333333]">
                        {DOMAIN_ICONS[step.domain] || <Layers size={13} />}
                      </div>
                      <span className="font-bold text-[#FFFFFF] text-[11px] capitalize">
                        {step.domain} Specialist
                      </span>
                      <span className="text-[10px] text-[#777777]">
                        Step 0{idx + 1}
                      </span>
                    </div>

                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      status === 'EXECUTING'
                        ? 'bg-[#10A37F] text-[#000000] animate-pulse'
                        : status === 'COMPLETED'
                        ? 'bg-[#222222] text-[#10A37F] border border-[#10A37F]/40'
                        : 'bg-[#1E1E1E] text-[#666666]'
                    }`}>
                      {status}
                    </span>
                  </div>

                  {/* Input Request Sub-Task */}
                  <div className="text-[11px] text-[#E0E0E0] bg-[#111111] p-1.5 rounded border border-[#222222] mb-1.5 font-mono">
                    "{step.request}"
                  </div>

                  {/* Domain-Bounded Tools Pills */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[9px] text-[#666666] self-center mr-1">Tools:</span>
                    {domainTools.map(t => {
                      const wasCalled = toolQueue.some(q => q.name === t);
                      return (
                        <span 
                          key={t} 
                          className={`text-[9px] px-1.5 py-0.2 rounded border ${
                            wasCalled
                              ? 'bg-[#1F2E24] text-[#10A37F] border-[#10A37F]/50 font-bold'
                              : 'bg-[#1A1A1A] text-[#777777] border-[#2A2A2A]'
                          }`}
                        >
                          {t}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-[#141414] border border-[#222222] rounded text-center text-[#666666] text-xs">
            Waiting for multi-step user instruction to construct execution workflow...
          </div>
        )}

        {/* Handoff Audit Trail */}
        {handoffs && handoffs.length > 0 && (
          <div className="mt-3 p-2.5 bg-[#121212] border border-[#222222] rounded-sm">
            <div className="flex items-center gap-1.5 text-[10px] text-[#888888] font-bold mb-2">
              <ShieldCheck size={12} className="text-[#10A37F]" />
              <span>AGENT HANDOFF EVENTS ({handoffs.length})</span>
            </div>
            <div className="space-y-1.5">
              {handoffs.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] text-[#CCCCCC] bg-[#171717] px-2 py-1 rounded border border-[#282828]">
                  <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                    <span className="text-[#888888]">{h.sourceAgent}</span>
                    <ArrowRight size={10} className="text-[#10A37F] shrink-0" />
                    <span className="text-[#FFFFFF] font-bold">{h.targetAgent}</span>
                    <span className="text-[#777777] truncate">"{h.request}"</span>
                  </div>
                  <span className="text-[#10A37F] text-[9px] font-bold">PASSED</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
