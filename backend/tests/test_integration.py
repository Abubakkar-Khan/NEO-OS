import pytest
import asyncio
from backend.state import global_os_state
from backend.agent.runner import global_agent_runner
from backend.events import global_event_bus, AgentEvent

@pytest.mark.asyncio
async def test_full_demo_command_integration():
    global_os_state.reset()
    captured_events = []

    def on_event(event: AgentEvent):
        captured_events.append(event)

    global_event_bus.subscribe(on_event)

    command = "Open the text editor, create a file called hello.txt, write Hello from Needle, save it, then open the browser and search for Next.js."
    result = await global_agent_runner.run(command, run_id="demo_test_run")

    assert result["status"] == "completed"

    # Verify virtual OS state changes:
    # 1. Text Editor opened
    assert "text-editor" in global_os_state.open_apps
    
    # 2. File created & saved
    assert global_os_state.filesystem.read_file("/hello.txt") == "Hello from Needle"
    
    # 3. Editor state updated
    assert global_os_state.editor_state["openFile"] == "/hello.txt"
    assert global_os_state.editor_state["content"] == "Hello from Needle"
    assert global_os_state.editor_state["dirty"] is False
    
    # 4. Browser opened
    assert "browser" in global_os_state.open_apps
    
    # 5. Search executed
    assert len(global_os_state.browser_state["searchResults"]) > 0
    assert "Next.js" in global_os_state.browser_state["url"]

    # 6. Event verification
    event_types = [e.type for e in captured_events]
    assert "user_input" in event_types
    assert "model_call" in event_types
    assert "tool_selected" in event_types
    assert "tool_started" in event_types
    assert "tool_completed" in event_types
    assert "agent_finished" in event_types

    global_event_bus.unsubscribe(on_event)
