import pytest
import asyncio
from backend.events import AgentEvent, EventBus

@pytest.mark.asyncio
async def test_event_generation_and_bus_subscription():
    bus = EventBus()
    received_events = []

    def subscriber(event: AgentEvent):
        received_events.append(event)

    bus.subscribe(subscriber)

    evt1 = AgentEvent(runId="test_run", type="user_input", arguments={"command": "Test input"})
    await bus.emit(evt1)

    evt2 = AgentEvent(runId="test_run", type="tool_selected", tool="open_app", arguments={"app": "browser"})
    await bus.emit(evt2)

    assert len(received_events) == 2
    assert received_events[0].type == "user_input"
    assert received_events[1].tool == "open_app"

    history = bus.get_history()
    assert len(history) == 2
