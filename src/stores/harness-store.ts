"use client";

import { create } from 'zustand';
import { HarnessState, RunStatus, ToolCall, AgentEvent, ToolStatus } from '@/lib/types';

interface HarnessStore extends HarnessState {
  parsedToolCalls: ToolCall[];
  reasoning: string | null;
  confidence: number | null;
  
  startRun: (command: string, runId: string) => void;
  setModelOutput: (output: string) => void;
  addToolCall: (toolCall: ToolCall) => void;
  updateToolStatus: (toolCallId: string, status: ToolStatus, result?: any, error?: string) => void;
  addEvent: (event: AgentEvent) => void;
  setWorkflow: (workflow: any) => void;
  addHandoff: (handoff: any) => void;
  setActiveAgent: (agent: string) => void;
  setAgentFinished: (data: { reasoning?: string; confidence?: number | null; result?: any }) => void;
  clearRun: () => void;
  reset: () => void;
}

const initialState: HarnessState & { parsedToolCalls: ToolCall[]; reasoning: string | null; confidence: number | null } = {
  currentCommand: null,
  modelOutput: null,
  toolQueue: [],
  parsedToolCalls: [],
  events: [],
  runStatus: 'idle',
  currentRunId: null,
  reasoning: null,
  confidence: null,
  workflow: null,
  activeAgent: null,
  handoffs: [],
};

export const useHarnessStore = create<HarnessStore>((set) => ({
  ...initialState,

  startRun: (command, runId) => {
    set({
      currentCommand: command,
      currentRunId: runId,
      runStatus: 'running',
      modelOutput: null,
      toolQueue: [],
      parsedToolCalls: [],
      events: [],
      reasoning: null,
      confidence: null,
      workflow: null,
      activeAgent: 'root_router',
      handoffs: [],
    });
  },

  setModelOutput: (output) => {
    set({ modelOutput: output });
  },

  setWorkflow: (workflow) => {
    set({ workflow });
  },

  addHandoff: (handoff) => {
    set((state) => ({
      handoffs: [...(state.handoffs || []), handoff],
      activeAgent: handoff.targetAgent,
    }));
  },

  setActiveAgent: (agent) => {
    set({ activeAgent: agent });
  },

  addToolCall: (toolCall) => {
    set((state) => ({
      toolQueue: [...state.toolQueue, toolCall],
      parsedToolCalls: [...state.parsedToolCalls, toolCall],
    }));
  },

  updateToolStatus: (toolCallId, status, result, error) => {
    set((state) => {
      const updateList = (list: ToolCall[]) => 
        list.map((tc) => {
          if (tc.id === toolCallId) {
            return {
              ...tc,
              status,
              ...(result !== undefined ? { result } : {}),
              ...(error !== undefined ? { error } : {}),
              ...(status === 'running' && !tc.startTime ? { startTime: Date.now() } : {}),
              ...((status === 'success' || status === 'failed') && !tc.endTime ? { endTime: Date.now() } : {}),
            };
          }
          return tc;
        });

      return {
        toolQueue: updateList(state.toolQueue),
        parsedToolCalls: updateList(state.parsedToolCalls),
      };
    });
  },

  addEvent: (event) => {
    set((state) => ({
      events: [...state.events, event]
    }));
  },

  setAgentFinished: ({ reasoning, confidence }) => {
    set({
      runStatus: 'completed',
      reasoning: reasoning || null,
      confidence: confidence ?? null,
    });
  },

  clearRun: () => {
    set({
      currentCommand: null,
      modelOutput: null,
      toolQueue: [],
      parsedToolCalls: [],
      events: [],
      runStatus: 'idle',
      currentRunId: null,
      reasoning: null,
      confidence: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
