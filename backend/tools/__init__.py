from backend.tools.registry import global_tool_registry
from backend.tools.desktop import register_desktop_tools
from backend.tools.filesystem import register_filesystem_tools
from backend.tools.editor import register_editor_tools
from backend.tools.browser import register_browser_tools
from backend.tools.system import register_system_tools

_registered = False

def init_all_tools():
    global _registered
    if not _registered:
        register_desktop_tools()
        register_filesystem_tools()
        register_editor_tools()
        register_browser_tools()
        register_system_tools()
        _registered = True

# Automatically initialize tools when package is imported
init_all_tools()
