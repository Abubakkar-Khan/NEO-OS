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
  permission_level?: 'automatic' | 'require_confirmation';
  execute?: (args: Record<string, unknown>, store?: unknown) => Promise<ToolResult>;
};

export type ToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status: ToolStatus;
  result?: ToolResult | unknown;
  startTime?: number;
  endTime?: number;
  error?: string;
};

// Event system
export type EventType =
  | 'user_input'
  | 'model_call'
  | 'tool_selected'
  | 'tool_started'
  | 'tool_completed'
  | 'tool_failed'
  | 'state_changed'
  | 'agent_finished'
  | 'USER_INPUT'
  | 'MODEL_CALL'
  | 'TOOL_SELECTED'
  | 'TOOL_VALIDATED'
  | 'TOOL_STARTED'
  | 'TOOL_COMPLETED'
  | 'TOOL_FAILED'
  | 'SYSTEM_ERROR';

export type AgentEvent = {
  runId: string;
  timestamp: number;
  type: EventType | string;
  agent?: string;
  tool?: string;
  arguments?: unknown;
  args?: unknown;
  result?: unknown;
  error?: string;
  confidence?: number;
  reasoning?: string;
  message?: string;
};

export type ToolEvent = AgentEvent;

// File system types
export type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  path?: string;
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
  maximized?: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
};

// Browser types
export type BrowserPage = {
  url: string;
  title: string;
  content: string;
  snippet?: string;
};

// Hierarchical Multi-Agent types
export type DomainType = 'desktop' | 'files' | 'editor' | 'browser' | 'system';

export type AgentHandoff = {
  runId: string;
  sourceAgent: string;
  targetAgent: string;
  request: string;
  context?: Record<string, unknown>;
  timestamp?: number;
};

export type WorkflowStep = {
  id: string;
  domain: DomainType;
  request: string;
  dependsOn: string[];
  status?: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
};

export type Workflow = {
  id: string;
  original_request: string;
  steps: WorkflowStep[];
  confidence: number;
  reasoning: string;
};

// Agent types
export type RunStatus = 'idle' | 'running' | 'completed' | 'error';

export type RunResult = {
  runId: string;
  status: RunStatus;
  toolCalls: ToolCall[];
  events: AgentEvent[];
  error?: string;
  reasoning?: string;
  confidence?: number;
  workflow?: Workflow;
};

// Harness types
export type HarnessState = {
  currentCommand: string | null;
  modelOutput: string | null;
  toolQueue: ToolCall[];
  events: AgentEvent[];
  runStatus: RunStatus;
  currentRunId: string | null;
  confidence?: number | null;
  reasoning?: string | null;
  workflow?: Workflow | null;
  activeAgent?: string | null;
  handoffs?: AgentHandoff[];
};

// Desktop screen & OS context
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
