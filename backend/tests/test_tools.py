import pytest
from backend.state import global_os_state
from backend.tools.registry import global_tool_registry
import backend.tools

def test_tool_registry_has_tools():
    tools = global_tool_registry.list_tools()
    assert len(tools) >= 20
    names = [t.name for t in tools]
    assert "open_app" in names
    assert "create_file" in names
    assert "write_file" in names
    assert "save_file" in names
    assert "open_browser" in names
    assert "search" in names

def test_tool_validation():
    # Valid call
    v1 = global_tool_registry.validate_call("create_file", {"path": "/test.txt"})
    assert v1["valid"] is True

    # Missing required parameter
    v2 = global_tool_registry.validate_call("create_file", {})
    assert v2["valid"] is False
    assert "Missing required parameter" in v2["error"]

    # Unknown tool
    v3 = global_tool_registry.validate_call("hack_mainframe", {})
    assert v3["valid"] is False
    assert "Unknown tool" in v3["error"]

def test_tool_execution():
    global_os_state.reset()
    res1 = global_tool_registry.execute("open_app", {"app": "text-editor"})
    assert "text-editor" in global_os_state.open_apps
    assert global_os_state.active_app == "text-editor"

    res2 = global_tool_registry.execute("create_file", {"path": "/sample.txt", "content": "Sample content"})
    assert "sample.txt" in res2
    assert global_os_state.filesystem.read_file("/sample.txt") == "Sample content"

    res3 = global_tool_registry.execute("search", {"query": "Next.js"})
    assert "Next.js" in res3
    assert len(global_os_state.browser_state["searchResults"]) > 0
