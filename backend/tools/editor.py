from backend.tools.registry import global_tool_registry
from backend.state import global_os_state

def open_editor(path: str) -> str:
    """Open the text editor with a virtual file path."""
    global_os_state.open_app("text-editor", title=f"Text Editor — {path.rsplit('/', 1)[-1]}")
    content = ""
    try:
        content = global_os_state.filesystem.read_file(path)
    except Exception:
        # If file doesn't exist yet, we can prepare an untitled buffer
        pass

    global_os_state.editor_state["openFile"] = path
    global_os_state.editor_state["content"] = content
    global_os_state.editor_state["dirty"] = False
    return f"Opened {path} in text editor"

def insert_text(content: str, path: str = "") -> str:
    """Insert or append text into the open text editor buffer."""
    current = global_os_state.editor_state.get("content", "")
    updated = current + content if not current else current + "\n" + content
    global_os_state.editor_state["content"] = updated
    global_os_state.editor_state["dirty"] = True
    target = path if (path and (path.startswith("/") or "." in path)) else (global_os_state.editor_state.get("openFile") or "/hello.txt")
    global_os_state.editor_state["openFile"] = target
    return f"Inserted {len(content)} characters into {target}"

def replace_text(content: str, path: str = "") -> str:
    """Replace entire content in the text editor buffer."""
    global_os_state.editor_state["content"] = content
    global_os_state.editor_state["dirty"] = True
    target = path if (path and (path.startswith("/") or "." in path)) else (global_os_state.editor_state.get("openFile") or "/hello.txt")
    global_os_state.editor_state["openFile"] = target
    return f"Replaced editor content with {len(content)} characters"

def save_file(path: str = "") -> str:
    """Save the text editor buffer content to the virtual filesystem."""
    target_path = path if (path and (path.startswith("/") or "." in path)) else (global_os_state.editor_state.get("openFile") or "/hello.txt")
    content = global_os_state.editor_state.get("content", "")
    global_os_state.filesystem.write_file(target_path, content)
    global_os_state.editor_state["openFile"] = target_path
    global_os_state.editor_state["dirty"] = False
    return f"Saved {target_path} to virtual filesystem ({len(content)} chars)"

def register_editor_tools():
    global_tool_registry.register(
        name="open_editor",
        description="Open the text editor with a specific file path.",
        category="editor",
        fn=open_editor,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Virtual file path to open"}
            },
            "required": ["path"]
        }
    )

    global_tool_registry.register(
        name="insert_text",
        description="Insert or append text content into the active editor buffer.",
        category="editor",
        fn=insert_text,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "content": {"type": "string", "description": "Text content to insert"},
                "path": {"type": "string", "description": "Target file path (optional)"}
            },
            "required": ["content"]
        }
    )

    global_tool_registry.register(
        name="replace_text",
        description="Replace text content in the editor buffer.",
        category="editor",
        fn=replace_text,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "content": {"type": "string", "description": "New replacement content"},
                "path": {"type": "string", "description": "Target file path (optional)"}
            },
            "required": ["content"]
        }
    )

    global_tool_registry.register(
        name="save_file",
        description="Save the current editor buffer to virtual disk.",
        category="editor",
        fn=save_file,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Virtual file path to save as (optional)"}
            },
            "required": []
        }
    )
