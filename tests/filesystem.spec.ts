import { expect } from 'chai';
import { 
  getParentPath, 
  getFileName, 
  getChildren, 
  resolvePathToNode, 
  getFullPath, 
  nodeExists 
} from '../src/services/filesystem';
import { FileNode } from '../src/lib/types';

describe('Filesystem Service (Mocha & Chai)', () => {
  const mockNodes: FileNode[] = [
    {
      id: 'root',
      name: '/',
      type: 'folder',
      parentId: null,
      createdAt: 1000,
      updatedAt: 1000
    },
    {
      id: 'docs',
      name: 'Documents',
      type: 'folder',
      parentId: 'root',
      createdAt: 1001,
      updatedAt: 1001
    },
    {
      id: 'notes',
      name: 'notes.txt',
      type: 'file',
      parentId: 'docs',
      content: 'Important thoughts',
      createdAt: 1002,
      updatedAt: 1002
    },
    {
      id: 'proj',
      name: 'Projects',
      type: 'folder',
      parentId: 'root',
      createdAt: 1003,
      updatedAt: 1003
    }
  ];

  it('correctly resolves getParentPath for root and nested paths', () => {
    expect(getParentPath('/')).to.equal('/');
    expect(getParentPath('/Documents')).to.equal('/');
    expect(getParentPath('/Documents/notes.txt')).to.equal('/Documents');
  });

  it('correctly extracts getFileName', () => {
    expect(getFileName('/Documents/notes.txt')).to.equal('notes.txt');
    expect(getFileName('/Projects')).to.equal('Projects');
    expect(getFileName('/')).to.equal('');
  });

  it('finds children for a directory node', () => {
    const rootChildren = getChildren('root', mockNodes);
    expect(rootChildren).to.have.lengthOf(2);
    expect(rootChildren.map(c => c.name)).to.include.members(['Documents', 'Projects']);

    const docChildren = getChildren('docs', mockNodes);
    expect(docChildren).to.have.lengthOf(1);
    expect(docChildren[0].name).to.equal('notes.txt');
  });

  it('resolves path to node accurately', () => {
    const rootNode = resolvePathToNode('/', mockNodes);
    expect(rootNode).to.not.be.null;
    expect(rootNode?.id).to.equal('root');

    const fileNode = resolvePathToNode('/Documents/notes.txt', mockNodes);
    expect(fileNode).to.not.be.null;
    expect(fileNode?.id).to.equal('notes');
    expect(fileNode?.content).to.equal('Important thoughts');

    const nonExistent = resolvePathToNode('/Unknown/fake.txt', mockNodes);
    expect(nonExistent).to.be.null;
  });

  it('computes full path for node id', () => {
    expect(getFullPath('notes', mockNodes)).to.equal('/Documents/notes.txt');
    expect(getFullPath('docs', mockNodes)).to.equal('/Documents');
    expect(getFullPath('root', mockNodes)).to.equal('/');
  });

  it('checks if a path exists', () => {
    expect(nodeExists('/Documents', mockNodes)).to.be.true;
    expect(nodeExists('/Documents/notes.txt', mockNodes)).to.be.true;
    expect(nodeExists('/Missing', mockNodes)).to.be.false;
  });
});
