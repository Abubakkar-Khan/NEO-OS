import { FileNode } from '@/lib/types';

export function getParentPath(path: string): string {
  if (path === '/' || path === '') return '/';
  const parts = path.replace(/\/$/, '').split('/');
  parts.pop();
  return parts.join('/') || '/';
}

export function getFileName(path: string): string {
  if (path === '/' || path === '') return '';
  const parts = path.replace(/\/$/, '').split('/');
  return parts[parts.length - 1];
}

export function getChildren(parentId: string, nodes: FileNode[]): FileNode[] {
  return nodes.filter((n) => n.parentId === parentId);
}

export function resolvePathToNode(path: string, nodes: FileNode[]): FileNode | null {
  if (path === '/' || path === '') {
    return nodes.find((n) => n.name === '/' && n.parentId === null) || null;
  }
  
  const parts = path.split('/').filter(Boolean);
  let current = nodes.find((n) => n.name === '/' && n.parentId === null);

  if (!current) return null;

  for (const part of parts) {
    const next = nodes.find((n) => n.parentId === current!.id && n.name === part);
    if (!next) return null;
    current = next;
  }

  return current;
}

export function getFullPath(nodeId: string, nodes: FileNode[]): string {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return '';
  if (node.parentId === null) return '/'; // root node

  let current = node;
  const parts: string[] = [];

  while (current.parentId !== null) {
    parts.unshift(current.name);
    const parent = nodes.find((n) => n.id === current.parentId);
    if (!parent) break;
    current = parent;
  }

  return '/' + parts.join('/');
}

export function nodeExists(path: string, nodes: FileNode[]): boolean {
  return resolvePathToNode(path, nodes) !== null;
}
