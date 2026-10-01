import inspect
import functools
import time
from typing import Dict, Any, List, Optional
from needle import Needle, tool

from backend.events import AgentEvent, global_event_bus
from backend.state import global_os_state
from backend.tools.registry import global_tool_registry

class BaseSpecialistAgent:
    """Base class for Domain Specialist Agents operating on shared OS state."""
    agent_id: str = "specialist"
    display_name = "Specialist Agent"
    allowed_tools: List[str] = []

    def __init__(self):
        self._needle: Optional[Needle] = None
        self._active_run_id: Optional[str] = None
        self._init_needle()

    def _init_needle(self):
        """Register only the strictly bounded tools for this specialist domain."""
        wrapped_tools = []
        for tool_name in self.allowed_tools:
            raw_def = global_tool_registry.get_tool(tool_name)
            orig_fn = global_tool_registry.get_function(tool_name)
            if not orig_fn or not raw_def:
                continue
            
            wrapped = self._create_proxy(tool_name, raw_def, orig_fn)
            wrapped_tools.append(wrapped)

        try:
            self._needle = Needle(
                tools=wrapped_tools,
                generation=2,
                stateless=True
            )
        except Exception as e:
            print(f"[{self.display_name}] Needle 2 init warning: {e}")
            self._needle = None

    def _create_proxy(self, tool_name: str, raw_def, orig_fn):
        sig = inspect.signature(orig_fn)

        @functools.wraps(orig_fn)
        def proxy(*args, **kwargs):
            run_id = self._active_run_id or "run_default"
            bound = sig.bind_partial(*args, **kwargs)
            bound.apply_defaults()
            call_kwargs = bound.arguments

            # 1. TOOL_SELECTED (with agent field)
            global_event_bus.emit_sync(AgentEvent(
                runId=run_id,
                agent=self.agent_id,
                type="tool_selected",
                tool=tool_name,
                arguments=call_kwargs
            ))

            # 2. Validation
            val = global_tool_registry.validate_call(tool_name, call_kwargs)
            if not val["valid"]:
                err = val["error"]
                global_event_bus.emit_sync(AgentEvent(
                    runId=run_id,
                    agent=self.agent_id,
                    type="tool_failed",
                    tool=tool_name,
                    arguments=call_kwargs,
                    error=err
                ))
                return f"Validation error: {err}"

            # 3. TOOL_STARTED
            global_event_bus.emit_sync(AgentEvent(
                runId=run_id,
                agent=self.agent_id,
                type="tool_started",
                tool=tool_name,
                arguments=call_kwargs
            ))

            time.sleep(0.06)

            try:
                # 4. Execute on shared virtual OS state
                res = global_tool_registry.execute(tool_name, call_kwargs, bypass_confirmation=True)

                # 5. TOOL_COMPLETED
                global_event_bus.emit_sync(AgentEvent(
                    runId=run_id,
                    agent=self.agent_id,
                    type="tool_completed",
                    tool=tool_name,
                    arguments=call_kwargs,
                    result=res
                ))

                # 6. STATE_CHANGED
                global_event_bus.emit_sync(AgentEvent(
                    runId=run_id,
                    agent=self.agent_id,
                    type="state_changed",
                    result=global_os_state.to_dict()
                ))

                return str(res)
            except Exception as e:
                err_msg = str(e)
                global_event_bus.emit_sync(AgentEvent(
                    runId=run_id,
                    agent=self.agent_id,
                    type="tool_failed",
                    tool=tool_name,
                    arguments=call_kwargs,
                    error=err_msg
                ))
                return f"Error executing {tool_name}: {err_msg}"

        proxy.__name__ = orig_fn.__name__
        proxy.__doc__ = raw_def.description
        return tool(proxy)

    def execute(self, request: str, run_id: str, context: Optional[Any] = None) -> Dict[str, Any]:
        """Execute request segment with Needle 2 and deterministic domain execution."""
        self._active_run_id = run_id
        confidence = 0.95
        reasoning = ""
        results = []

        if self._needle:
            try:
                res = self._needle.run(query=request, max_steps=4)
                if res.get("confidence") is not None and isinstance(res.get("confidence"), (int, float)):
                    confidence = float(res.get("confidence"))
                reasoning = res.get("reasoning", "")
                results = res.get("results", [])
            except Exception as e:
                print(f"[{self.display_name}] Specialist run exception: {e}")

        # Check if Needle succeeded or if validation/execution failed or confidence is low
        has_errors = any(isinstance(r, str) and ("Validation error" in r or "Error executing" in r) for r in results)
        if not results or has_errors or confidence < 0.6:
            fallback_res = self._fallback_execute(request, run_id)
            if fallback_res:
                results = fallback_res
                confidence = max(confidence, 0.95)

        self._active_run_id = None
        return {
            "agent": self.agent_id,
            "confidence": round(confidence, 4),
            "reasoning": reasoning,
            "results": results
        }

    def _fallback_execute(self, request: str, run_id: str) -> List[Any]:
        """Domain-specific deterministic tool execution when query needs precise parameter extraction."""
        return []
