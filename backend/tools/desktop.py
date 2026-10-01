from backend.tools.registry import global_tool_registry
from backend.state import global_os_state

def open_app(app: str) -> str:
    """Open an application window on the desktop: editor, file_manager, browser, settings."""
    win = global_os_state.open_app(app)
    return f"Opened application: {win['title']}"

def close_app(app: str) -> str:
    """Close an application or window on the desktop."""
    global_os_state.close_app(app)
    return f"Closed application: {app}"

def focus_app(app: str) -> str:
    """Focus and bring an application window to the foreground."""
    global_os_state.focus_app(app)
    return f"Focused application: {app}"

def minimize_app(app: str) -> str:
    """Minimize an application window to the taskbar."""
    global_os_state.minimize_app(app)
    return f"Minimized application: {app}"

def register_desktop_tools():
    global_tool_registry.register(
        name="open_app",
        description="Open an application on the simulated desktop (editor, file_manager, browser, settings).",
        category="desktop",
        fn=open_app,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "app": {"type": "string", "description": "The application to open (editor, file_manager, browser, settings)"}
            },
            "required": ["app"]
        }
    )

    global_tool_registry.register(
        name="close_app",
        description="Close an application window on the simulated desktop.",
        category="desktop",
        fn=close_app,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "app": {"type": "string", "description": "Application name or window ID to close"}
            },
            "required": ["app"]
        }
    )

    global_tool_registry.register(
        name="focus_app",
        description="Focus or switch to an application window.",
        category="desktop",
        fn=focus_app,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "app": {"type": "string", "description": "Application name to bring to the front"}
            },
            "required": ["app"]
        }
    )

    global_tool_registry.register(
        name="minimize_app",
        description="Minimize an application window.",
        category="desktop",
        fn=minimize_app,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "app": {"type": "string", "description": "Application name to minimize"}
            },
            "required": ["app"]
        }
    )
