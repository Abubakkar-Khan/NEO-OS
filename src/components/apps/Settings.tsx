'use client';

import React from 'react';
import { useDesktopStore } from '@/stores/desktop-store';
import { toolRegistry } from '@/tools/registry';
import '@/tools/definitions'; // Ensure definitions are registered
import { ToolDefinition } from '@/lib/types';

export default function Settings() {
  const { settings, toggleSound, toggleAnimations, toggleCrtTerminal, resetDesktop } = useDesktopStore();

  let registeredTools: ToolDefinition[] = [];
  try {
    if (toolRegistry && typeof toolRegistry.getAll === 'function') {
      registeredTools = toolRegistry.getAll();
    }
  } catch (e) {
    console.error("Failed to load tool registry", e);
  }

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#000000] font-mono text-xs overflow-y-auto select-none">
      <div className="p-4 space-y-6">
        
        {/* System */}
        <section>
          <h2 className="text-sm font-bold border-b border-[#000000] pb-1 mb-3 bg-[#F5F5F2] px-2 flex justify-between items-center">
            <span>SYSTEM OVERVIEW</span>
            <span className="text-[10px] text-[#888888]">SIMULATED OS</span>
          </h2>
          <div className="px-2 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#666666]">Product</span>
              <span className="font-bold">NeedleOS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">OS Version</span>
              <span className="font-bold">1.0.0 (MVP)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">AI Agent Core</span>
              <span className="font-bold">Needle 2 (Context-Aware Runner)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">Registered Tools</span>
              <span className="font-bold">{registeredTools.length} tools</span>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-sm font-bold border-b border-[#000000] pb-1 mb-3 bg-[#F5F5F2] px-2">
            PREFERENCES &amp; GSAP ANIMATIONS
          </h2>
          <div className="px-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">Sound Feedback</div>
                <div className="text-[10px] text-[#777777]">Enable system clicks and audio cue triggers</div>
              </div>
              <button 
                onClick={toggleSound}
                className={`px-3 py-1 border border-[#000000] w-16 text-center font-bold text-xs ${settings.sound ? 'bg-[#000000] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#000000]'}`}
              >
                {settings.sound ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">GSAP UI Animations</div>
                <div className="text-[10px] text-[#777777]">Smooth window opening, minimize, focus, and cards entrance</div>
              </div>
              <button 
                onClick={toggleAnimations}
                className={`px-3 py-1 border border-[#000000] w-16 text-center font-bold text-xs ${settings.animations ? 'bg-[#000000] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#000000]'}`}
              >
                {settings.animations ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">ThreeUI CRT Terminal (Zion Phosphor)</div>
                <div className="text-[10px] text-[#777777]">Authored WebGL CRT green phosphor scanline backdrop</div>
              </div>
              <button 
                onClick={toggleCrtTerminal}
                className={`px-3 py-1 border border-[#000000] w-16 text-center font-bold text-xs ${settings.crtTerminal ? 'bg-[#000000] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#000000]'}`}
              >
                {settings.crtTerminal ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section>
          <h2 className="text-sm font-bold border-b border-[#000000] pb-1 mb-3 bg-[#F5F5F2] px-2">
            KEYBOARD SHORTCUTS
          </h2>
          <div className="px-2 space-y-2 text-xs">
            <div className="flex justify-between border-b border-[#E5E5E0] pb-1">
              <span>Execute Command / Send</span>
              <span className="bg-[#D9D9D9] px-1.5 py-0.5 rounded-sm font-bold">Enter</span>
            </div>
            <div className="flex justify-between border-b border-[#E5E5E0] pb-1">
              <span>Voice Dictation (Mic)</span>
              <span className="bg-[#D9D9D9] px-1.5 py-0.5 rounded-sm font-bold">Click Mic Icon</span>
            </div>
            <div className="flex justify-between border-b border-[#E5E5E0] pb-1">
              <span>Toggle Desktop / Harness</span>
              <span className="bg-[#D9D9D9] px-1.5 py-0.5 rounded-sm font-bold">Taskbar Button</span>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section>
          <h2 className="text-sm font-bold border-b border-[#000000] pb-1 mb-3 bg-[#F5F5F2] px-2 flex justify-between items-center">
            <span>REGISTERED AGENT TOOLS</span>
            <span className="text-[10px] text-[#888888]">{registeredTools.length} active</span>
          </h2>
          <div className="px-2">
            {registeredTools.length === 0 ? (
              <div className="text-[#888888] italic">No tools registered</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#000000] text-[10px] text-[#666666]">
                    <th className="py-1 w-1/4">Name</th>
                    <th className="py-1 w-1/5">Category</th>
                    <th className="py-1">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredTools.map((tool, i) => (
                    <tr key={i} className="border-b border-[#E5E5E0] hover:bg-[#F5F5F2]">
                      <td className="py-1 pr-2 font-bold font-mono text-[11px]">{tool.name}</td>
                      <td className="py-1 pr-2 text-[#777777] uppercase text-[10px]">{tool.category || 'System'}</td>
                      <td className="py-1 text-[11px] text-[#333333]" title={tool.description}>{tool.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-2">
          <h2 className="text-sm font-bold text-[#000000] border-b border-[#000000] pb-1 mb-3 bg-[#E5E5E0] px-2">
            RESET &amp; MAINTENANCE
          </h2>
          <div className="px-2">
            <p className="text-xs text-[#666666] mb-3">
              Reset virtual filesystem to defaults, clear open windows, reset editor and browser states.
            </p>
            <button 
              onClick={() => { if(confirm('Reset virtual desktop to clean default state?')) resetDesktop() }}
              className="w-full py-2 border border-[#000000] bg-[#FFFFFF] hover:bg-[#000000] hover:text-[#FFFFFF] transition-colors font-bold uppercase text-xs"
            >
              Reset Virtual Desktop
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
