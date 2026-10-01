from typing import List, Any, Optional
from backend.agent.specialists.base_specialist import BaseSpecialistAgent
from backend.tools.registry import global_tool_registry
from backend.events import AgentEvent, global_event_bus
from backend.state import global_os_state

class SystemAgent(BaseSpecialistAgent):
    agent_id = "system_agent"
    display_name = "System Agent"
    allowed_tools = [
        "get_time",
        "get_system_info",
        "change_setting",
        "reset_desktop"
    ]

    def _fallback_execute(self, request: str, run_id: str, context: Optional[Any] = None) -> List[Any]:
        low = request.lower()
        results = []

        if "time" in low:
            res = self._run_tool("get_time", {}, run_id)
            results.append(res)
        elif "info" in low or "system" in low or "what" in low:
            res = self._run_tool("get_system_info", {}, run_id)
            results.append(res)
        elif "reset" in low:
            res = self._run_tool("reset_desktop", {}, run_id)
            results.append(res)

        return results

    def _run_tool(self, tool_name: str, args: dict, run_id: str):
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_selected", tool=tool_name, arguments=args))
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_started", tool=tool_name, arguments=args))
        res = global_tool_registry.execute(tool_name, args, bypass_confirmation=True)
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_completed", tool=tool_name, arguments=args, result=res))
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="state_changed", result=global_os_state.to_dict()))
        return res
