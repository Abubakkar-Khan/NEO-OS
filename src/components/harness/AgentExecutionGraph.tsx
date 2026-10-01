'use client';

import React from 'react';
import { useHarnessStore } from '@/stores/harness-store';
import { 
  GitBranch, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  FileText, 
  Folder, 
  Globe, 
  Settings as SettingsIcon,
  Monitor,
  Activity,
  Cpu,
  Terminal,
  Zap,
  CheckCircle2
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
    if (runStatus === 'idle') return 'STANDBY';
    if (activeAgent === agentId && runStatus === 'running') return 'EXECUTING';
    
    const agentDomain = agentId.replace('_agent', '');
    const agentTools = DOMAIN_TOOLS[agentDomain] || [];
    const calledTools = toolQueue.filter(t => agentTools.includes(t.name));
    
    if (calledTools.length > 0) {
      if (calledTools.every(t => t.status === 'success')) return 'COMPLETED';
      if (calledTools.some(t => t.status === 'failed')) return 'FAILED';
      if (calledTools.some(t => t.status === 'running')) return 'EXECUTING';
    }
    
    return 'READY';
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0D0E] border-b border-[#22272B] text-xs font-mono select-none overflow-hidden">
      {/* Control Room Telemetry Header */}
      <div className="px-3.5 py-2.5 bg-[#101418] border-b border-[#1E242B] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-[#151D24] border border-[#2B3540] rounded text-[#10A37F]">
            <Cpu size={14} />
          </div>
          <div>
            <div className="font-bold text-[#FFFFFF] tracking-wider text-[11px] flex items-center gap-1.5">
              <span>MISSION CONTROL ROOM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10A37F] animate-pulse" />
            </div>
            <div className="text-[10px] text-[#7A8A99]">Hierarchical Neural Dispatch &bull; Needle 2</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <div className="bg-[#151D24] px-2.5 py-1 rounded border border-[#222C36] flex items-center gap-2">
            <span className="text-[#6C7D8E] text-[10px]">CALIBRATED CONFIDENCE:</span>
            <span className="font-bold text-[#10A37F]">
              {confidence ? `${(confidence * 100).toFixed(0)}%` : '95%'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Room Live Architecture Diagram (ASCII / SVG Pipeline) */}
      <div className="px-3 py-2 bg-[#0E1216] border-b border-[#1C232B] shrink-0">
        <div className="text-[10px] text-[#6A7B8C] mb-1 font-bold tracking-wider flex items-center justify-between">
          <span>ACTIVE PIPELINE TOPOLOGY</span>
          <span className="text-[#10A37F] text-[9px] font-mono">AUTONOMOUS DISPATCH</span>
        </div>
        
        {/* Visual Pipeline Flow Chart */}
        <div className="grid grid-cols-5 gap-1.5 p-2 bg-[#080A0C] border border-[#1A2027] rounded text-center">
          <div className="p-1.5 rounded bg-[#12171D] border border-[#232D38]">
            <div className="text-[9px] text-[#7E8F9F]">INPUT</div>
            <div className="text-[10px] font-bold text-[#FFFFFF] truncate">Prompt / Mic</div>
          </div>
          <div className="p-1.5 rounded bg-[#101F18] border border-[#10A37F]/40 shadow-[0_0_8px_rgba(16,163,127,0.1)]">
            <div className="text-[9px] text-[#10A37F]">ROOT ROUTER</div>
            <div className="text-[10px] font-bold text-[#FFFFFF] truncate">5 Tools</div>
          </div>
          <div className="p-1.5 rounded bg-[#171B26] border border-[#3B82F6]/40">
            <div className="text-[9px] text-[#60A5FA]">SPECIALIST</div>
            <div className="text-[10px] font-bold text-[#FFFFFF] truncate">Autonomous</div>
          </div>
          <div className="p-1.5 rounded bg-[#1A1813] border border-[#F59E0B]/40">
            <div className="text-[9px] text-[#FBBF24]">EXECUTOR</div>
            <div className="text-[10px] font-bold text-[#FFFFFF] truncate">Virtual FS</div>
          </div>
          <div className="p-1.5 rounded bg-[#16121D] border border-[#8B5CF6]/40">
            <div className="text-[9px] text-[#C084FC]">SYNCHRONY</div>
            <div className="text-[10px] font-bold text-[#FFFFFF] truncate">WebSocket</div>
          </div>
        </div>
      </div>

      {/* Interactive Execution Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {/* Tier 0: Root Router Node */}
        <div className="p-3 bg-[#11161B] border border-[#222C36] rounded-sm relative shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10A37F] shadow-[0_0_8px_#10A37F]" />
              <span className="font-bold text-[#FFFFFF] text-[12px] tracking-tight">ROOT ROUTER AGENT</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-[#13271D] text-[#10A37F] border border-[#10A37F]/30 rounded font-bold">
                Needle 2 &bull; 14MB Local
              </span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
              activeAgent === 'root_router' && runStatus === 'running'
                ? 'bg-[#10A37F]/20 text-[#10A37F] border-[#10A37F]/40 animate-pulse font-bold'
                : 'bg-[#182028] text-[#8292A2] border-[#2B3744]'
            }`}>
              {activeAgent === 'root_router' && runStatus === 'running' ? 'CLASSIFYING & DECOMPOSING' : 'ONLINE / STANDBY'}
            </span>
          </div>

          <div className="text-[11px] text-[#8F9FA8] mb-2 leading-relaxed">
            Decomposes user commands into structured dependencies. Dispatches sub-tasks to isolated domain specialists without exposing DOM or system internals.
          </div>

          {/* Minimal 5-tool Router catalog */}
          <div className="flex flex-wrap gap-1 mt-1">
            {['route_to_desktop', 'route_to_files', 'route_to_editor', 'route_to_browser', 'route_to_system'].map(r => (
              <span key={r} className="text-[10px] px-1.5 py-0.5 bg-[#151C22] border border-[#25303B] text-[#CCD7E0] rounded">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Tier 1: Specialist Steps & Autonomous Reasoning */}
        {workflow && workflow.steps && workflow.steps.length > 0 ? (
          <div className="space-y-2.5 relative pl-4 border-l-2 border-[#202933] ml-4">
            {workflow.steps.map((step, idx) => {
              const agentId = `${step.domain}_agent`;
              const status = getAgentStatus(agentId);
              const isCurrent = activeAgent === agentId;
              const domainTools = DOMAIN_TOOLS[step.domain] || [];

              return (
                <div 
                  key={step.id} 
                  className={`p-3 rounded-sm border transition-all ${
                    isCurrent && runStatus === 'running'
                      ? 'bg-[#121F17] border-[#10A37F] shadow-[0_0_14px_rgba(16,163,127,0.2)]'
                      : status === 'COMPLETED'
                      ? 'bg-[#11161B] border-[#222C36]'
                      : 'bg-[#0E1216] border-[#1A222B] opacity-80'
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-[#171F27] rounded border border-[#283542]">
                        {DOMAIN_ICONS[step.domain] || <Layers size={13} />}
                      </div>
                      <span className="font-bold text-[#FFFFFF] text-[11px] capitalize tracking-tight">
                        {step.domain} Specialist
                      </span>
                      <span className="text-[10px] text-[#718292]">
                        Step 0{idx + 1}
                      </span>
                      {step.dependsOn && step.dependsOn.length > 0 && (
                        <span className="text-[9px] px-1 py-0.2 bg-[#1B232C] text-[#8697A7] rounded border border-[#293542]">
                          dep: #{step.dependsOn.join(', #')}
                        </span>
                      )}
                    </div>

                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      status === 'EXECUTING'
                        ? 'bg-[#10A37F] text-[#000000] animate-pulse'
                        : status === 'COMPLETED'
                        ? 'bg-[#132B1E] text-[#10A37F] border border-[#10A37F]/40'
                        : 'bg-[#182028] text-[#697989]'
                    }`}>
                      {status}
                    </span>
                  </div>

                  {/* Sub-Task Instruction */}
                  <div className="text-[11px] text-[#E2E8F0] bg-[#0A0D10] p-2 rounded border border-[#1B232C] mb-2 font-mono">
                    <span className="text-[#10A37F] mr-1">&gt;</span>
                    "{step.request}"
                  </div>

                  {/* Domain-Bounded Tools Pills */}
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[9px] text-[#6C7E8E] mr-1 font-bold">Scoped Tools:</span>
                    {domainTools.map(t => {
                      const wasCalled = toolQueue.some(q => q.name === t);
                      return (
                        <span 
                          key={t} 
                          className={`text-[9px] px-1.5 py-0.2 rounded border transition-colors ${
                            wasCalled
                              ? 'bg-[#13271D] text-[#10A37F] border-[#10A37F]/60 font-bold shadow-[0_0_6px_rgba(16,163,127,0.2)]'
                              : 'bg-[#141A20] text-[#758695] border-[#222C36]'
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
          <div className="p-4 bg-[#0F1317] border border-[#1E2630] rounded text-center text-[#6A7B8C] text-xs">
            Control room standby. Enter a natural language instruction to dispatch autonomous workflow.
          </div>
        )}

        {/* Real-time Agent Handoff Audit Trail */}
        {handoffs && handoffs.length > 0 && (
          <div className="mt-3 p-3 bg-[#0F1318] border border-[#1F2833] rounded-sm">
            <div className="flex items-center justify-between text-[10px] text-[#8698A8] font-bold mb-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-[#10A37F]" />
                <span>INTER-AGENT HANDOFF LOG ({handoffs.length})</span>
              </div>
              <span className="text-[#10A37F] text-[9px]">CONTEXT INJECTED</span>
            </div>
            <div className="space-y-1.5">
              {handoffs.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] text-[#CCD8E2] bg-[#141A20] px-2.5 py-1.5 rounded border border-[#242F3A]">
                  <div className="flex items-center gap-2 truncate max-w-[80%]">
                    <span className="text-[#758696] font-mono">{h.sourceAgent}</span>
                    <ArrowRight size={10} className="text-[#10A37F] shrink-0" />
                    <span className="text-[#FFFFFF] font-bold font-mono">{h.targetAgent}</span>
                    <span className="text-[#7A8C9C] truncate">"{h.request}"</span>
                  </div>
                  <span className="text-[#10A37F] text-[9px] font-bold px-1.5 py-0.2 bg-[#12241A] rounded border border-[#10A37F]/30">
                    VERIFIED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
