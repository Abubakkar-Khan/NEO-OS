import type { ToolDefinition } from '@/lib/types';

class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool ${tool.name} is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getByCategory(category: string): ToolDefinition[] {
    return this.getAll().filter(tool => tool.category === category);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  getToolSchemas(): Array<{ name: string; description: string; parameters: Record<string, unknown> }> {
    return this.getAll().map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  }
}

export const toolRegistry = new ToolRegistry();
