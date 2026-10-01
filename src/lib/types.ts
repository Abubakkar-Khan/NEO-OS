export type ToolStatus = 'pending' | 'running' | 'success' | 'failed';

export type ToolResult = {
  success: boolean;
  message: string;
  data?: unknown;
};

export type ToolDefinition = {
  name: string;
  description: string;
  category: 'desktop' | 'filesystem' | 'editor' | 'browser' | 'system';
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (args: Record<string, unknown>, store: unknown) => Promise<ToolResult>;
};

export type ToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status: ToolStatus;
  result?: ToolResult;
  startTime?: number;
  endTime?: number;
  error?: string;
};

// Event system
export type EventType =
  | 'USER_INPUT'
  | 'MODEL_CALL'
  | 'TOOL_SELECTED'
  | 'TOOL_VALIDATED'
  | 'TOOL_STARTED'
  | 'TOOL_COMPLETED'
  | 'TOOL_FAILED'
  | 'SYSTEM_ERROR';

export type ToolEvent = {
  runId: string;
  timestamp: number;
  type: EventType | string;
  tool?: string;
  args?: unknown;
  result?: unknown;
  error?: string;
  message?: string;
};

// File system types
export type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  createdAt: number;
  updatedAt: number;
};

// App types  
export type AppId = 'file-manager' | 'text-editor' | 'browser' | 'settings';

export type AppWindow = {
  id: string;
  appId: AppId;
  title: string;
  minimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
};

// Browser types
export type BrowserPage = {
  url: string;
  title: string;
  content: string;
};

// Agent types
export type RunStatus = 'idle' | 'running' | 'completed' | 'error';

export type RunResult = {
  runId: string;
  status: RunStatus;
  toolCalls: ToolCall[];
  events: ToolEvent[];
  error?: string;
};

// Harness types
export type HarnessState = {
  currentCommand: string | null;
  modelOutput: string | null;
  toolQueue: ToolCall[];
  events: ToolEvent[];
  runStatus: RunStatus;
  currentRunId: string | null;
};

// Desktop screen & OS context for agent awareness
export type DesktopContext = {
  activeApp: AppId | null;
  activeWindowTitle: string | null;
  activeWindowId: string | null;
  openWindows: Array<{ id: string; appId: AppId; title: string; minimized: boolean }>;
  editor: {
    isOpen: boolean;
    activeFileId: string | null;
    activeFileName: string | null;
    content: string;
    dirty: boolean;
  };
  browser: {
    isOpen: boolean;
    url: string;
    hasSearchResults: boolean;
    searchResultsCount: number;
  };
  filesystem: {
    filesCount: number;
    foldersCount: number;
  };
};
