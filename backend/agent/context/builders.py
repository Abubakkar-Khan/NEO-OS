from typing import Dict, Any
from backend.state import VirtualOSState

def build_files_context(state: VirtualOSState) -> Dict[str, Any]:
    """Provide bounded filesystem context for FilesAgent."""
    entries = []
    nodes = list(state.filesystem.nodes.values())
    for node in nodes:
        entries.append({
            "name": node.name,
            "type": node.type,
            "path": node.path
        })
    return {
        "current_directory": "/",
        "total_files": len([n for n in nodes if n.type == "file"]),
        "total_folders": len([n for n in nodes if n.type == "folder"]),
        "items": entries[:25]
    }

def build_editor_context(state: VirtualOSState) -> Dict[str, Any]:
    """Provide bounded editor context for EditorAgent."""
    ed = state.editor_state
    content = ed.get("content", "")
    return {
        "open_file": ed.get("openFile"),
        "dirty": ed.get("dirty", False),
        "content_length": len(content),
        "line_count": len(content.splitlines()) if content else 0
    }

def build_browser_context(state: VirtualOSState) -> Dict[str, Any]:
    """Provide bounded browser context for BrowserAgent."""
    br = state.browser_state
    return {
        "current_url": br.get("url", ""),
        "history_count": len(br.get("history", [])),
        "recent_searches_count": len(br.get("searchResults", []))
    }

def build_desktop_context(state: VirtualOSState) -> Dict[str, Any]:
    """Provide bounded window and desktop context for DesktopAgent."""
    return {
        "open_apps": state.open_apps,
        "active_app": state.active_app,
        "windows": [
            {"id": w.get("id"), "app": w.get("appId"), "title": w.get("title"), "minimized": w.get("minimized")}
            for w in state.windows
        ],
        "total_open": len(state.windows)
    }

def build_system_context(state: VirtualOSState) -> Dict[str, Any]:
    """Provide bounded system context for SystemAgent."""
    return {
        "os_name": "NeedleOS",
        "version": "1.0.0",
        "settings": state.settings,
        "active_run": True
    }
