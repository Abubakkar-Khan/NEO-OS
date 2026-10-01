import pytest
from backend.tools.registry import global_tool_registry
import backend.tools

def test_automatic_permissions():
    auto_tools = ["open_app", "close_app", "create_file", "create_folder", "write_file", "save_file", "search", "navigate"]
    for t_name in auto_tools:
        tool = global_tool_registry.get_tool(t_name)
        assert tool is not None, f"Tool {t_name} not found"
        assert tool.permission_level == "automatic", f"Tool {t_name} should be automatic"

def test_require_confirmation_permissions():
    restricted_tools = ["delete_file", "reset_desktop"]
    for t_name in restricted_tools:
        tool = global_tool_registry.get_tool(t_name)
        assert tool is not None, f"Tool {t_name} not found"
        assert tool.permission_level == "require_confirmation", f"Tool {t_name} must require confirmation"

def test_blocked_execution_without_confirmation():
    # Attempting to delete a file without confirmation bypass must raise PermissionError
    with pytest.raises(PermissionError):
        global_tool_registry.execute("delete_file", {"path": "/todo.txt"}, bypass_confirmation=False)
