import re
from typing import List, Any, Optional
from backend.agent.specialists.base_specialist import BaseSpecialistAgent
from backend.tools.registry import global_tool_registry
from backend.events import AgentEvent, global_event_bus
from backend.state import global_os_state

class DesktopAgent(BaseSpecialistAgent):
    agent_id = "desktop_agent"
    display_name = "Desktop Agent"
    allowed_tools = [
        "open_app",
        "close_app",
        "focus_app",
        "minimize_app",
        "maximize_app"
    ]

    def _fallback_execute(self, request: str, run_id: str, context: Optional[Any] = None) -> List[Any]:
        low = request.lower()
        results = []

        target_app = "text-editor"
        if "browser" in low:
            target_app = "browser"
        elif "file" in low or "files" in low or "computer" in low or "folder" in low:
            target_app = "file-manager"
        elif "setting" in low:
            target_app = "settings"

        if "close" in low:
            res = self._run_tool("close_app", {"app": target_app}, run_id)
            results.append(res)
        elif "minimize" in low:
            res = self._run_tool("minimize_app", {"app": target_app}, run_id)
            results.append(res)
        elif "maximize" in low:
            res = self._run_tool("maximize_app", {"app": target_app}, run_id)
            results.append(res)
        else:
            # Default open/focus
            res = self._run_tool("open_app", {"app": target_app}, run_id)
            results.append(res)

        return results

    def _run_tool(self, tool_name: str, args: dict, run_id: str):
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_selected", tool=tool_name, arguments=args))
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_started", tool=tool_name, arguments=args))
        res = global_tool_registry.execute(tool_name, args, bypass_confirmation=True)
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_completed", tool=tool_name, arguments=args, result=res))
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="state_changed", result=global_os_state.to_dict()))
        return res
