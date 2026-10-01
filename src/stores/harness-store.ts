"use client";

import { create } from 'zustand';
import { HarnessState, RunStatus, ToolCall, ToolEvent, ToolStatus } from '@/lib/types';

interface HarnessStore extends HarnessState {
  parsedToolCalls: ToolCall[]; // For convenience if we want to store parsed separately
  
  startRun: (command: string, runId: string) => void;
  setModelOutput: (output: string) => void;
  addToolCall: (toolCall: ToolCall) => void;
  updateToolStatus: (toolCallId: string, status: ToolStatus, result?: any, error?: string) => void;
  addEvent: (event: ToolEvent) => void;
  clearRun: () => void;
  reset: () => void;
}

const initialState: HarnessState & { parsedToolCalls: ToolCall[] } = {
  currentCommand: null,
  modelOutput: null,
  toolQueue: [],
  parsedToolCalls: [],
  events: [],
  runStatus: 'idle',
  currentRunId: null,
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
    });
  },

  setModelOutput: (output) => {
    set({ modelOutput: output });
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

  clearRun: () => {
    set({
      currentCommand: null,
      modelOutput: null,
      toolQueue: [],
      parsedToolCalls: [],
      events: [],
      runStatus: 'idle',
      currentRunId: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
