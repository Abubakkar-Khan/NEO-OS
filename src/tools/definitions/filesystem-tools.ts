import { toolRegistry } from '../registry';
import { useDesktopStore } from '@/stores/desktop-store';

toolRegistry.register({
  name: 'list_files',
  description: 'List directory contents',
  category: 'filesystem',
  parameters: {
    path: { type: 'string', description: 'The path to list (default: /)' }
  },
  execute: async (args) => {
    const path = String(args.path || '/');
    const state = useDesktopStore.getState();
    const node = state.getNodeByPath(path);
    if (!node) return { success: false, message: `Path not found: ${path}` };
    if (node.type !== 'folder') return { success: false, message: `Path is not a folder: ${path}` };
    
    const files = state.listDirectory(node.id);
    return { success: true, message: `Listed contents of ${path}`, data: files };
  }
});

toolRegistry.register({
  name: 'create_file',
  description: 'Create a new file',
  category: 'filesystem',
  parameters: {
    path: { type: 'string', description: 'Full path of the new file', required: true },
    content: { type: 'string', description: 'Initial content of the file' }
  },
  execute: async (args) => {
    const path = String(args.path);
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop();
    const parentPath = '/' + parts.join('/');
    
    if (!name) return { success: false, message: `Invalid path: ${path}` };
    
    const state = useDesktopStore.getState();
    if (state.getNodeByPath(path)) return { success: false, message: `File already exists: ${path}` };
    
    const parent = state.getNodeByPath(parentPath);
    if (!parent) return { success: false, message: `Parent directory not found: ${parentPath}` };
    
    state.createFile(name, parent.id, args.content ? String(args.content) : undefined);
    return { success: true, message: `Created file ${path}` };
  }
});

toolRegistry.register({
  name: 'create_folder',
  description: 'Create a new folder',
  category: 'filesystem',
  parameters: {
    path: { type: 'string', description: 'Full path of the new folder', required: true }
  },
  execute: async (args) => {
    const path = String(args.path);
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop();
    const parentPath = '/' + parts.join('/');
    
    if (!name) return { success: false, message: `Invalid path: ${path}` };
    
    const state = useDesktopStore.getState();
    if (state.getNodeByPath(path)) return { success: false, message: `Folder already exists: ${path}` };
    
    const parent = state.getNodeByPath(parentPath);
    if (!parent) return { success: false, message: `Parent directory not found: ${parentPath}` };
    
    state.createFolder(name, parent.id);
    return { success: true, message: `Created folder ${path}` };
  }
});

toolRegistry.register({
  name: 'read_file',
  description: 'Read file contents',
  category: 'filesystem',
  parameters: {
    path: { type: 'string', description: 'Full path of the file to read', required: true }
  },
  execute: async (args) => {
    const path = String(args.path);
    const state = useDesktopStore.getState();
    const node = state.getNodeByPath(path);
    
    if (!node) return { success: false, message: `File not found: ${path}` };
    if (node.type !== 'file') return { success: false, message: `Path is not a file: ${path}` };
    
    const content = state.readFile(node.id);
    return { success: true, message: `Read ${path}`, data: { content } };
  }
});

toolRegistry.register({
  name: 'write_file',
  description: 'Write content to a file',
  category: 'filesystem',
  parameters: {
    path: { type: 'string', description: 'Full path of the file', required: true },
    content: { type: 'string', description: 'Content to write', required: true }
  },
  execute: async (args) => {
    const path = String(args.path);
    const content = String(args.content);
    const state = useDesktopStore.getState();
    let node = state.getNodeByPath(path);
    
    if (!node) {
      // Create if it doesn't exist
      const parts = path.split('/').filter(Boolean);
      const name = parts.pop();
      const parentPath = '/' + parts.join('/');
      if (!name) return { success: false, message: `Invalid path: ${path}` };
      
      const parent = state.getNodeByPath(parentPath);
      if (!parent) return { success: false, message: `Parent directory not found: ${parentPath}` };
      
      state.createFile(name, parent.id, content);
      return { success: true, message: `Created and wrote to ${path}` };
    }
    
    if (node.type !== 'file') return { success: false, message: `Path is not a file: ${path}` };
    
    state.writeFile(node.id, content);
    return { success: true, message: `Wrote to ${path}` };
  }
});

toolRegistry.register({
  name: 'rename_file',
  description: 'Rename a file',
  category: 'filesystem',
  parameters: {
    from: { type: 'string', description: 'Full path of file to rename', required: true },
    to: { type: 'string', description: 'New full path or just new name', required: true }
  },
  execute: async (args) => {
    const from = String(args.from);
    let to = String(args.to);
    const state = useDesktopStore.getState();
    const node = state.getNodeByPath(from);
    
    if (!node) return { success: false, message: `File not found: ${from}` };
    if (node.type !== 'file') return { success: false, message: `Path is not a file: ${from}` };
    
    if (to.includes('/')) {
      const parts = to.split('/').filter(Boolean);
      to = parts.pop() || to;
    }
    
    state.renameNode(node.id, to);
    return { success: true, message: `Renamed file to ${to}` };
  }
});

toolRegistry.register({
  name: 'rename_folder',
  description: 'Rename a folder',
  category: 'filesystem',
  parameters: {
    from: { type: 'string', description: 'Full path of folder to rename', required: true },
    to: { type: 'string', description: 'New full path or just new name', required: true }
  },
  execute: async (args) => {
    const from = String(args.from);
    let to = String(args.to);
    const state = useDesktopStore.getState();
    const node = state.getNodeByPath(from);
    
    if (!node) return { success: false, message: `Folder not found: ${from}` };
    if (node.type !== 'folder') return { success: false, message: `Path is not a folder: ${from}` };
    
    if (to.includes('/')) {
      const parts = to.split('/').filter(Boolean);
      to = parts.pop() || to;
    }
    
    state.renameNode(node.id, to);
    return { success: true, message: `Renamed folder to ${to}` };
  }
});

toolRegistry.register({
  name: 'delete_file',
  description: 'Delete a file or folder',
  category: 'filesystem',
  parameters: {
    path: { type: 'string', description: 'Full path to delete', required: true }
  },
  execute: async (args) => {
    const path = String(args.path);
    const state = useDesktopStore.getState();
    const node = state.getNodeByPath(path);
    
    if (!node) return { success: false, message: `Path not found: ${path}` };
    
    state.deleteNode(node.id);
    return { success: true, message: `Deleted ${path}` };
  }
});

toolRegistry.register({
  name: 'move_file',
  description: 'Move a file to another directory',
  category: 'filesystem',
  parameters: {
    from: { type: 'string', description: 'Full path of source', required: true },
    to: { type: 'string', description: 'Full path of destination folder', required: true }
  },
  execute: async (args) => {
    const from = String(args.from);
    const to = String(args.to);
    const state = useDesktopStore.getState();
    
    const sourceNode = state.getNodeByPath(from);
    if (!sourceNode) return { success: false, message: `Source not found: ${from}` };
    
    const destNode = state.getNodeByPath(to);
    if (!destNode) return { success: false, message: `Destination not found: ${to}` };
    if (destNode.type !== 'folder') return { success: false, message: `Destination is not a folder: ${to}` };
    
    state.moveNode(sourceNode.id, destNode.id);
    return { success: true, message: `Moved ${from} to ${to}` };
  }
});
