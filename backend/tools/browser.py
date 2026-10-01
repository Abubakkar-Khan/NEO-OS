from backend.tools.registry import global_tool_registry
from backend.state import global_os_state

def open_browser() -> str:
    """Open the simulated web browser window."""
    global_os_state.open_app("browser", title="Browser — Virtual Sandbox")
    return "Opened simulated web browser"

def search(query: str) -> str:
    """Search for a query in the simulated browser."""
    global_os_state.open_app("browser", title=f"Browser — Search: {query}")
    results = global_os_state.search_browser(query)
    return f"Executed search for '{query}': found {len(results)} simulated result(s)"

def navigate(url: str) -> str:
    """Navigate to a URL in the browser."""
    global_os_state.open_app("browser", title=f"Browser — {url}")
    global_os_state.browser_state["url"] = url
    global_os_state.browser_state["history"].append(url)
    global_os_state.browser_state["searchResults"] = []
    return f"Navigated browser to: {url}"

def go_back() -> str:
    """Navigate back in the browser history."""
    history = global_os_state.browser_state.get("history", [])
    if len(history) > 1:
        history.pop()
        prev = history[-1]
        global_os_state.browser_state["url"] = prev
        return f"Went back to: {prev}"
    return "Browser is at initial page (no previous history)"

def register_browser_tools():
    global_tool_registry.register(
        name="open_browser",
        description="Open the simulated web browser window.",
        category="browser",
        fn=open_browser,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {},
            "required": []
        }
    )

    global_tool_registry.register(
        name="search",
        description="Search for a query in the browser (returns simulated result pages).",
        category="browser",
        fn=search,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query keywords"}
            },
            "required": ["query"]
        }
    )

    global_tool_registry.register(
        name="navigate",
        description="Navigate to a specific URL in the browser.",
        category="browser",
        fn=navigate,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL address to navigate to"}
            },
            "required": ["url"]
        }
    )

    global_tool_registry.register(
        name="go_back",
        description="Navigate back in browser history.",
        category="browser",
        fn=go_back,
        permission_level="automatic",
        parameters={
            "type": "object",
            "properties": {},
            "required": []
        }
    )
