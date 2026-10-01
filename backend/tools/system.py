from typing import Any
import datetime
from backend.tools.registry import global_tool_registry
from backend.state import global_os_state

def get_time() -> str:
    """Get the current system time."""
    now = datetime.datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S")

def get_system_info() -> dict:
    """Get system and AI model information."""
    tools_count = len(global_tool_registry.list_tools())
    return {
        "os_name": "NEO-OS",
        "version": "1.0.0",
        "ai_engine": "Needle 3 (cactus-needle, generation=3)",
        "tools_registered": tools_count,
        "environment": "Virtual Simulated Desktop",
        "security": "Isolated in-memory virtual state (no host access)"
    }

def change_setting(key: str, value: Any) -> str:
    """Change a system setting (sound, animations)."""
    k = str(key).lower().strip()
    if k in ("sound", "audio"):
        val = bool(value) if not isinstance(value, str) else value.lower() in ("true", "1", "on")
        global_os_state.settings["sound"] = val
        return f"Updated setting sound = {val}"
    elif k in ("animations", "anim", "motion"):
        val = bool(value) if not isinstance(value, str) else value.lower() in ("true", "1", "on")
        global_os_state.settings["animations"] = val
        return f"Updated setting animations = {val}"
    else:
        global_os_state.settings[k] = value
        return f"Updated setting {k} = {value}"

def reset_desktop() -> str:
    """Reset the virtual desktop back to factory defaults (requires user confirmation)."""
    global_os_state.reset()
    return "Virtual desktop reset to initial state"

def register_system_tools():
    global_tool_registry.register(
        name="get_time",
        description="Retrieve the current system clock time.",
        category="system",
        fn=get_time,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {},
            "required": []
        }
    )

    global_tool_registry.register(
        name="get_system_info",
        description="Retrieve NeedleOS platform metadata, tool statistics, and model details.",
        category="system",
        fn=get_system_info,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {},
            "required": []
        }
    )

    global_tool_registry.register(
        name="change_setting",
        description="Change a desktop preference setting (sound, animations).",
        category="system",
        fn=change_setting,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "key": {"type": "string", "description": "Setting key (e.g. sound, animations)"},
                "value": {"type": "string", "description": "Setting value (true, false, on, off)"}
            },
            "required": ["key", "value"]
        }
    )

    global_tool_registry.register(
        name="reset_desktop",
        description="Reset virtual operating system state back to factory defaults (requires confirmation).",
        category="system",
        fn=reset_desktop,
        permission_level="require_confirmation",
        parameters={
            "type": "object",
            "properties": {},
            "required": []
        }
    )
