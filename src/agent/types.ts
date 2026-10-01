import { DesktopContext } from '@/lib/types';

export interface ParsedToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface NeedleAdapter {
  parseCommand(
    input: string,
    availableTools: ToolSchema[],
    context?: DesktopContext
  ): Promise<ParsedToolCall[]>;
}
