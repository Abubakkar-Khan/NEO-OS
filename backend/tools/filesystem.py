from typing import List, Dict, Any
from backend.tools.registry import global_tool_registry
from backend.state import global_os_state

def list_files(path: str = "/") -> List[Dict[str, Any]]:
    """List directory contents in the virtual filesystem."""
    return global_os_state.filesystem.list_files(path)

def create_file(path: str, content: str = "") -> str:
    """Create a new file in the virtual filesystem."""
    node = global_os_state.filesystem.create_file(path, content)
    return f"Created file: {node.path}"

def create_folder(path: str) -> str:
    """Create a new folder in the virtual filesystem."""
    node = global_os_state.filesystem.create_folder(path)
    return f"Created folder: {node.path}"

def read_file(path: str) -> str:
    """Read contents of a file in the virtual filesystem."""
    return global_os_state.filesystem.read_file(path)

def write_file(path: str, content: str) -> str:
    """Write or overwrite text content to a file in the virtual filesystem."""
    node = global_os_state.filesystem.write_file(path, content)
    # Also update editor state if this file is open
    if global_os_state.editor_state.get("openFile") == node.path:
        global_os_state.editor_state["content"] = content
        global_os_state.editor_state["dirty"] = False
    return f"Wrote content ({len(content)} characters) to: {node.path}"

def rename_file(path: str, new_name: str) -> str:
    """Rename a file in the virtual filesystem."""
    node = global_os_state.filesystem.rename_node(path, new_name)
    return f"Renamed file to: {node.path}"

def rename_folder(path: str, new_name: str) -> str:
    """Rename a folder in the virtual filesystem."""
    node = global_os_state.filesystem.rename_node(path, new_name)
    return f"Renamed folder to: {node.path}"

def delete_file(path: str) -> str:
    """Delete a file or folder from the virtual filesystem (requires confirmation)."""
    deleted = global_os_state.filesystem.delete_node(path)
    return f"Deleted: {deleted}"

def move_file(source: str, destination: str) -> str:
    """Move a file to a destination folder in the virtual filesystem."""
    node = global_os_state.filesystem.move_node(source, destination)
    return f"Moved {source} to {node.path}"

def register_filesystem_tools():
    global_tool_registry.register(
        name="list_files",
        description="List files and folders in a virtual directory path.",
        category="filesystem",
        fn=list_files,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Virtual directory path (e.g. / or /Documents)"}
            },
            "required": ["path"]
        }
    )

    global_tool_registry.register(
        name="create_file",
        description="Create a new virtual file at the specified path.",
        category="filesystem",
        fn=create_file,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Virtual path (e.g. hello.txt or /Projects/main.py)"},
                "content": {"type": "string", "description": "Initial text content of the file"}
            },
            "required": ["path"]
        }
    )

    global_tool_registry.register(
        name="create_folder",
        description="Create a new virtual folder at the specified path.",
        category="filesystem",
        fn=create_folder,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Virtual folder path (e.g. /Projects or /Documents/Archive)"}
            },
            "required": ["path"]
        }
    )

    global_tool_registry.register(
        name="read_file",
        description="Read the contents of a virtual file.",
        category="filesystem",
        fn=read_file,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Path to the virtual file"}
            },
            "required": ["path"]
        }
    )

    global_tool_registry.register(
        name="write_file",
        description="Write text content to a virtual file.",
        category="filesystem",
        fn=write_file,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Path to the file to write to"},
                "content": {"type": "string", "description": "Text content to write"}
            },
            "required": ["path", "content"]
        }
    )

    global_tool_registry.register(
        name="rename_file",
        description="Rename a virtual file.",
        category="filesystem",
        fn=rename_file,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Current virtual file path"},
                "new_name": {"type": "string", "description": "New file name"}
            },
            "required": ["path", "new_name"]
        }
    )

    global_tool_registry.register(
        name="rename_folder",
        description="Rename a virtual folder.",
        category="filesystem",
        fn=rename_folder,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Current virtual folder path"},
                "new_name": {"type": "string", "description": "New folder name"}
            },
            "required": ["path", "new_name"]
        }
    )

    global_tool_registry.register(
        name="delete_file",
        description="Delete a virtual file or folder (requires explicit user confirmation).",
        category="filesystem",
        fn=delete_file,
        permission_level="require_confirmation",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Virtual path of file to delete"}
            },
            "required": ["path"]
        }
    )

    global_tool_registry.register(
        name="move_file",
        description="Move a virtual file into another virtual folder.",
        category="filesystem",
        fn=move_file,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "source": {"type": "string", "description": "Source file path"},
                "destination": {"type": "string", "description": "Destination directory path"}
            },
            "required": ["source", "destination"]
        }
    )
