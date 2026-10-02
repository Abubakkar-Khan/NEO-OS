'use client';

import React from 'react';
import { useDesktopStore } from '@/stores/desktop-store';
import { toolRegistry } from '@/tools/registry';
import '@/tools/definitions';
import { ToolDefinition } from '@/lib/types';
import { Volume2, Sparkles, Terminal, RotateCcw, Cpu, ShieldCheck } from 'lucide-react';
import { audioEngine } from '@/lib/audio';

export default function Settings() {
  const { settings, toggleSound, toggleAnimations, resetDesktop } = useDesktopStore();

  let registeredTools: ToolDefinition[] = [];
  try {
    if (toolRegistry && typeof toolRegistry.getAll === 'function') {
      registeredTools = toolRegistry.getAll();
    }
  } catch (e) {
    console.error("Failed to load tool registry", e);
  }

  const handleSoundToggle = () => {
    toggleSound();
    if (!settings.sound) {
      setTimeout(() => audioEngine.playSuccess(), 50);
    }
  };

  const handleTestSound = () => {
    audioEngine.playSuccess();
  };

  const handleAnimationToggle = () => {
    audioEngine.playClick();
    toggleAnimations();
  };

  const handleReset = () => {
    audioEngine.playAlert();
    if (confirm('Reset virtual desktop to clean default state?')) {
      resetDesktop();
      audioEngine.playSuccess();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#111111] font-sans text-xs overflow-y-auto select-none">
      <div className="p-6 max-w-2xl mx-auto w-full space-y-6">
        
        {/* ─── Header & System Overview ─── */}
        <section className="bg-[#FAF9F5] rounded-2xl p-5 border border-[#EAEAE4] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center font-mono font-bold text-xs">
                N
              </div>
              <div>
                <h1 className="font-bold text-sm text-[#111111] tracking-tight">NEO-OS</h1>
                <p className="text-[11px] text-[#777772] font-mono">Nothing Utilitarian Edition · v1.2</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E0E0DA] text-[10px] font-mono font-semibold text-[#111111]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>ONLINE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
            <div className="bg-white p-2.5 rounded-xl border border-[#E8E8E2]">
              <div className="text-[10px] text-[#888882] uppercase tracking-wider mb-0.5">Core</div>
              <div className="font-semibold text-[#111111]">Needle 3</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-[#E8E8E2]">
              <div className="text-[10px] text-[#888882] uppercase tracking-wider mb-0.5">Architecture</div>
              <div className="font-semibold text-[#111111]">Hierarchical</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-[#E8E8E2]">
              <div className="text-[10px] text-[#888882] uppercase tracking-wider mb-0.5">Tools</div>
              <div className="font-semibold text-[#111111]">{registeredTools.length} Active</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-[#E8E8E2]">
              <div className="text-[10px] text-[#888882] uppercase tracking-wider mb-0.5">Fast-Path</div>
              <div className="font-semibold text-[#D71920]">&lt;1ms Engine</div>
            </div>
          </div>
        </section>

        {/* ─── Preferences & Micro-Haptics ─── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#777772]">
              Physical Haptics &amp; Motion
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAEAE4] divide-y divide-[#F0EFEB]">
            {/* Sound Feedback */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#EAEAE4] flex items-center justify-center text-[#555550]">
                  <Volume2 size={16} />
                </div>
                <div>
                  <div className="font-semibold text-xs text-[#111111]">Audio Micro-Haptics</div>
                  <div className="text-[11px] text-[#777772]">Synthesized mechanical clicks and tactile tone cues</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {settings.sound && (
                  <button 
                    onClick={handleTestSound}
                    className="px-2.5 py-1 rounded-full border border-[#E0E0DA] bg-[#FAF9F5] hover:bg-white text-[10px] font-mono font-medium text-[#444440] transition-colors"
                  >
                    Test Cue
                  </button>
                )}
                <button 
                  onClick={handleSoundToggle}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    settings.sound ? 'bg-[#111111]' : 'bg-[#E5E5DF]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                    settings.sound ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* GSAP Motion */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#EAEAE4] flex items-center justify-center text-[#555550]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="font-semibold text-xs text-[#111111]">Fluid GSAP Motion</div>
                  <div className="text-[11px] text-[#777772]">Organic physics, breathing mascot, and spring transitions</div>
                </div>
              </div>
              <button 
                onClick={handleAnimationToggle}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  settings.animations ? 'bg-[#111111]' : 'bg-[#E5E5DF]'
                }`}
              >
                <span className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                  settings.animations ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </section>

        {/* ─── Keyboard Shortcuts ─── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#777772]">
              Keyboard Shortcuts
            </h2>
          </div>
          <div className="bg-[#FAF9F5] rounded-2xl p-4 border border-[#EAEAE4] space-y-2.5 font-mono text-[11px]">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#EFEFEA]">
              <span className="text-[#444440]">Focus Spotlight Command Bar</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-white border border-[#E0E0DA] font-semibold text-[#111111] shadow-2xs">Ctrl + K / ⌘K</kbd>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#EFEFEA]">
              <span className="text-[#444440]">Command History (Terminal)</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-white border border-[#E0E0DA] font-semibold text-[#111111] shadow-2xs">↑ / ↓ Arrow</kbd>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#EFEFEA]">
              <span className="text-[#444440]">Toggle Control Room &amp; Graph</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-white border border-[#E0E0DA] font-semibold text-[#111111] shadow-2xs">Taskbar Pill</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#444440]">Poke Alive Mascot</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-white border border-[#E0E0DA] font-semibold text-[#111111] shadow-2xs">Click Character</kbd>
            </div>
          </div>
        </section>

        {/* ─── Registered Agent Tools ─── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
              <h2 className="font-bold text-xs uppercase tracking-wider text-[#777772]">
                Agent Tool Catalog
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#888882]">{registeredTools.length} registered</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAEAE4] overflow-hidden">
            <div className="divide-y divide-[#F4F4F0] max-h-56 overflow-y-auto">
              {registeredTools.map((tool, i) => (
                <div key={i} className="p-3 flex items-start justify-between hover:bg-[#FAF9F5] transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <div className="font-mono font-semibold text-xs text-[#111111]">{tool.name}</div>
                    <div className="text-[11px] text-[#777772]">{tool.description}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAEAE4] font-mono text-[10px] uppercase text-[#666660] shrink-0">
                    {tool.category || 'System'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Reset Desktop ─── */}
        <section className="pt-2">
          <div className="rounded-2xl border border-[#FFE2E2] bg-[#FFF8F8] p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-[#D71920]">Reset Virtual Desktop</div>
              <div className="text-[11px] text-[#995555]">Restore filesystem, open windows, and editor states to clean initial state.</div>
            </div>
            <button 
              onClick={handleReset}
              className="px-4 py-2 rounded-full bg-[#D71920] hover:bg-[#B5141A] text-white font-sans font-medium text-xs transition-colors shadow-2xs"
            >
              Reset All
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
