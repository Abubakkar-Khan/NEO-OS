import { toolRegistry } from './registry';
import type { ToolCall, ToolResult } from '@/lib/types';
import './definitions'; // Ensure tools are registered

export function validateToolCall(toolCall: ToolCall): { valid: boolean; error?: string } {
  const tool = toolRegistry.get(toolCall.name);
  if (!tool) {
    return { valid: false, error: `Tool not found: ${toolCall.name}` };
  }

  for (const [paramName, paramDef] of Object.entries(tool.parameters)) {
    if (paramDef.required && toolCall.arguments[paramName] === undefined) {
      return { valid: false, error: `Missing required parameter: ${paramName}` };
    }
  }

  return { valid: true };
}

export async function executeTool(
  toolCall: ToolCall,
  store?: unknown
): Promise<ToolResult> {
  try {
    const validation = validateToolCall(toolCall);
    if (!validation.valid) {
      return { success: false, message: validation.error || 'Invalid tool call' };
    }

    const tool = toolRegistry.get(toolCall.name);
    if (!tool || !tool.execute) {
      return { success: false, message: `Tool execution function not found for: ${toolCall.name}` };
    }

    const result = await tool.execute(toolCall.arguments, store);
    return result;
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error during execution' 
    };
  }
}
