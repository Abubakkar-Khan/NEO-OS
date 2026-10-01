import { useDesktopStore } from '@/stores/desktop-store';
import { useHarnessStore } from '@/stores/harness-store';
import { AgentEvent, ToolCall } from '@/lib/types';
import { generateId } from '@/lib/utils';

const API_BASE = 'http://localhost:8000';
const WS_BASE = 'ws://localhost:8000/ws';

class BackendClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;
  private isConnected = false;

  public init() {
    if (typeof window === 'undefined') return;
    this.connectWs();
    this.fetchInitialState();
  }

  public async fetchInitialState() {
    try {
      const res = await fetch(`${API_BASE}/api/state`);
      if (res.ok) {
        const state = await res.json();
        useDesktopStore.getState().syncFromBackend(state);
      }
    } catch (e) {
      // Backend may be starting up
    }
  }

  private connectWs() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(WS_BASE);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data);
        } catch (e) {
          console.error('[WS] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectTimer && typeof window !== 'undefined') {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connectWs();
      }, 2500);
    }
  }

  private handleIncomingMessage(data: any) {
    const harness = useHarnessStore.getState();
    const desktop = useDesktopStore.getState();

    if (data.type === 'state_sync') {
      if (data.state) {
        desktop.syncFromBackend(data.state);
      }
      if (data.events && Array.isArray(data.events)) {
        data.events.forEach((evt: AgentEvent) => harness.addEvent(evt));
      }
      return;
    }

    if (data.type === 'agent_event') {
      const evt: AgentEvent = data.event;
      if (!evt) return;

      // Always add event to event log
      harness.addEvent(evt);

      // Handle event types
      const typeLower = evt.type.toLowerCase();

      if (typeLower === 'user_input') {
        const cmd = (evt.arguments as any)?.command || evt.message || '';
        harness.startRun(cmd, evt.runId);
      } else if (typeLower === 'model_call') {
        harness.setModelOutput(JSON.stringify(evt.arguments || { model: 'Needle 2', generation: 2 }, null, 2));
      } else if (typeLower === 'tool_selected') {
        const tc: ToolCall = {
          id: `${evt.runId}_${evt.tool}_${Date.now()}`,
          name: evt.tool || 'unknown_tool',
          arguments: (evt.arguments as Record<string, unknown>) || {},
          status: 'pending'
        };
        harness.addToolCall(tc);
      } else if (typeLower === 'tool_started') {
        const tools = harness.toolQueue;
        const matching = tools.find(t => t.name === evt.tool && t.status === 'pending');
        if (matching) {
          harness.updateToolStatus(matching.id, 'running');
        }
      } else if (typeLower === 'tool_completed') {
        const tools = harness.toolQueue;
        const matching = tools.find(t => t.name === evt.tool && (t.status === 'running' || t.status === 'pending'));
        if (matching) {
          harness.updateToolStatus(matching.id, 'success', evt.result);
        }
      } else if (typeLower === 'tool_failed') {
        const tools = harness.toolQueue;
        const matching = tools.find(t => t.name === evt.tool && (t.status === 'running' || t.status === 'pending'));
        if (matching) {
          harness.updateToolStatus(matching.id, 'failed', undefined, evt.error);
        }
      } else if (typeLower === 'state_changed') {
        if (data.state) {
          desktop.syncFromBackend(data.state);
        }
      } else if (typeLower === 'agent_finished') {
        harness.setAgentFinished({
          reasoning: evt.reasoning || '',
          confidence: evt.confidence ?? null,
          result: evt.result
        });
      }
    }
  }

  public async runCommand(command: string): Promise<string> {
    const runId = `run_${generateId()}`;
    const harness = useHarnessStore.getState();
    harness.startRun(command, runId);

    try {
      const res = await fetch(`${API_BASE}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, runId })
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      return runId;
    } catch (e: any) {
      // Fallback: send through WebSocket if open
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'run', command, runId }));
        return runId;
      }
      harness.addEvent({
        runId,
        timestamp: Date.now(),
        type: 'SYSTEM_ERROR',
        error: `Could not connect to FastAPI backend at ${API_BASE}. Make sure the backend server is running.`
      });
      throw e;
    }
  }

  public async sendAction(tool: string, args: Record<string, unknown> = {}) {
    try {
      const res = await fetch(`${API_BASE}/api/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, arguments: args })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          useDesktopStore.getState().syncFromBackend(data.state);
        }
      }
    } catch (e) {
      // Offline fallback
    }
  }
}

export const backendClient = new BackendClient();
