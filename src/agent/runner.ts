import { generateId } from '@/lib/utils';
import { toolRegistry } from '@/tools/registry';
import { executeTool, validateToolCall } from '@/tools/executor';
import { useHarnessStore } from '@/stores/harness-store';
import { useDesktopStore } from '@/stores/desktop-store';
import { RunResult, ToolCall, ToolEvent, DesktopContext } from '@/lib/types';
import { needleAdapter } from './needle-adapter';

export class AgentRunner {
  async run(input: string): Promise<RunResult> {
    const harness = useHarnessStore.getState();
    const runId = generateId();

    // startRun expects (command, runId)
    harness.startRun(input, runId);

    const events: ToolEvent[] = [];
    const toolCalls: ToolCall[] = [];

    const addEvt = (type: string, data?: Partial<ToolEvent>) => {
      const event: ToolEvent = { runId, timestamp: Date.now(), type, ...data };
      events.push(event);
      harness.addEvent(event);
    };

    addEvt('USER_INPUT', { message: input });

    try {
      addEvt('MODEL_CALL');

      // ── Build Screen & Desktop Context for Agentic Awareness ──
      const desktop = useDesktopStore.getState();
      const activeWin = desktop.openWindows.find(w => w.id === desktop.activeWindowId && !w.minimized);
      const editorFile = desktop.editor.openFile ? desktop.filesystem.find(f => f.id === desktop.editor.openFile) : null;

      const context: DesktopContext = {
        activeApp: activeWin ? activeWin.appId : null,
        activeWindowTitle: activeWin ? activeWin.title : null,
        activeWindowId: activeWin ? activeWin.id : null,
        openWindows: desktop.openWindows.map(w => ({
          id: w.id,
          appId: w.appId,
          title: w.title,
          minimized: w.minimized,
        })),
        editor: {
          isOpen: desktop.openWindows.some(w => w.appId === 'text-editor' && !w.minimized),
          activeFileId: desktop.editor.openFile,
          activeFileName: editorFile ? editorFile.name : null,
          content: desktop.editor.content,
          dirty: desktop.editor.dirty,
        },
        browser: {
          isOpen: desktop.openWindows.some(w => w.appId === 'browser' && !w.minimized),
          url: desktop.browser.url,
          hasSearchResults: (desktop.browser.searchResults?.length || 0) > 0,
          searchResultsCount: desktop.browser.searchResults?.length || 0,
        },
        filesystem: {
          filesCount: desktop.filesystem.filter(f => f.type === 'file').length,
          foldersCount: desktop.filesystem.filter(f => f.type === 'folder').length,
        },
      };

      const availableTools = toolRegistry.getToolSchemas();
      const parsedCalls = await needleAdapter.parseCommand(input, availableTools, context);

      // setModelOutput expects (output: string)
      harness.setModelOutput(JSON.stringify(parsedCalls, null, 2));

      if (parsedCalls.length === 0) {
        addEvt('SYSTEM_ERROR', { error: 'No tool calls could be parsed from the input' });
        return {
          runId,
          status: 'error',
          toolCalls,
          events,
          error: 'Could not understand the command. Try rephrasing.',
        };
      }

      for (const parsed of parsedCalls) {
        const toolCall: ToolCall = {
          id: generateId(),
          name: parsed.name,
          arguments: parsed.arguments,
          status: 'pending',
        };

        toolCalls.push(toolCall);
        harness.addToolCall(toolCall);
        addEvt('TOOL_SELECTED', { tool: toolCall.name, args: toolCall.arguments });

        const validation = validateToolCall(toolCall);
        if (!validation.valid) {
          toolCall.status = 'failed';
          toolCall.error = validation.error;
          // updateToolStatus(id, status, result?, error?)
          harness.updateToolStatus(toolCall.id, 'failed', undefined, validation.error);
          addEvt('TOOL_FAILED', { tool: toolCall.name, error: validation.error });
          continue;
        }

        addEvt('TOOL_VALIDATED', { tool: toolCall.name });

        toolCall.status = 'running';
        toolCall.startTime = Date.now();
        harness.updateToolStatus(toolCall.id, 'running');
        addEvt('TOOL_STARTED', { tool: toolCall.name });

        // Small delay so the UI can show progression
        await new Promise((resolve) => setTimeout(resolve, 80));

        try {
          const result = await executeTool(toolCall);
          toolCall.status = result.success ? 'success' : 'failed';
          toolCall.endTime = Date.now();
          toolCall.result = result;

          if (result.success) {
            harness.updateToolStatus(toolCall.id, 'success', result);
          } else {
            harness.updateToolStatus(toolCall.id, 'failed', result, result.message);
          }

          addEvt(result.success ? 'TOOL_COMPLETED' : 'TOOL_FAILED', {
            tool: toolCall.name,
            result: result.data,
            error: result.success ? undefined : result.message,
          });
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          toolCall.status = 'failed';
          toolCall.endTime = Date.now();
          toolCall.error = msg;
          harness.updateToolStatus(toolCall.id, 'failed', undefined, msg);
          addEvt('TOOL_FAILED', { tool: toolCall.name, error: msg });
        }

        // Small delay between tool executions
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      return { runId, status: 'completed', toolCalls, events };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addEvt('SYSTEM_ERROR', { error: msg });
      return { runId, status: 'error', toolCalls, events, error: msg };
    }
  }
}

export const agentRunner = new AgentRunner();
