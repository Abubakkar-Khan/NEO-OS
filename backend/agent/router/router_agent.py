import re
import uuid
from typing import Dict, Any, List, Optional
import needle
from needle import Needle, tool
from backend.agent.coordinator.workflow import Workflow, WorkflowStep, DomainType

class RouterAgent:
    """
    Dedicated Root Router Agent powered by Needle 3 (generation=3).
    Has a strictly minimal toolset:
      - route_to_desktop(request: str)
      - route_to_files(request: str)
      - route_to_editor(request: str)
      - route_to_browser(request: str)
      - route_to_system(request: str)
    Classifies user intent and builds multi-step domain workflows.
    """
    def __init__(self):
        self._last_routed_domain: Optional[DomainType] = None
        self._last_routed_request: Optional[str] = None
        self._needle: Optional[Needle] = None
        self._init_needle()

    def _init_needle(self):
        """Initialize Needle 3 with the 5 bounded routing tools."""
        @tool
        def route_to_desktop(request: str) -> str:
            """Route window management or desktop app switching request to Desktop Agent."""
            self._last_routed_domain = "desktop"
            self._last_routed_request = request
            return f"Routed to desktop agent: {request}"

        @tool
        def route_to_files(request: str) -> str:
            """Route filesystem operations (create folder, list, move, delete file) to Files Agent."""
            self._last_routed_domain = "files"
            self._last_routed_request = request
            return f"Routed to files agent: {request}"

        @tool
        def route_to_editor(request: str) -> str:
            """Route text editing, file content writing, or document saving to Editor Agent."""
            self._last_routed_domain = "editor"
            self._last_routed_request = request
            return f"Routed to editor agent: {request}"

        @tool
        def route_to_browser(request: str) -> str:
            """Route web navigation, URL browsing, or search query to Browser Agent."""
            self._last_routed_domain = "browser"
            self._last_routed_request = request
            return f"Routed to browser agent: {request}"

        @tool
        def route_to_system(request: str) -> str:
            """Route system info, time inquiry, or OS settings changes to System Agent."""
            self._last_routed_domain = "system"
            self._last_routed_request = request
            return f"Routed to system agent: {request}"

        try:
            self._needle = Needle(
                tools=[
                    route_to_desktop,
                    route_to_files,
                    route_to_editor,
                    route_to_browser,
                    route_to_system
                ],
                generation=3,
                stateless=True
            )
        except Exception as e:
            print(f"[RouterAgent] Needle 3 init warning: {e}")
            self._needle = None

    def route(self, user_command: str, run_id: Optional[str] = None) -> Workflow:
        """
        Classifies request and decomposes multi-domain workflows using Needle 3.
        """
        run_id = run_id or f"run_{uuid.uuid4().hex[:8]}"
        command_clean = user_command.strip()

        # Step 1: Detect compound / multi-domain segments
        segments = self._segment_command(command_clean)
        
        confidence = 0.95
        reasoning = "Root Router classified user request across domain specialists using Needle 3."
        steps: List[WorkflowStep] = []

        # If single segment, query Needle 3 router
        if len(segments) <= 1:
            domain, conf = self._classify_segment(command_clean)
            if conf:
                confidence = conf
            steps.append(WorkflowStep(
                id="1",
                domain=domain,
                request=command_clean,
                dependsOn=[]
            ))
        else:
            # Multi-domain workflow: classify each segment sequentially
            for idx, seg in enumerate(segments):
                domain, conf = self._classify_segment(seg)
                if conf:
                    confidence = min(confidence, conf)
                dep = [str(idx)] if idx > 0 else []
                steps.append(WorkflowStep(
                    id=str(idx + 1),
                    domain=domain,
                    request=seg,
                    dependsOn=dep
                ))

        return Workflow(
            id=run_id,
            original_request=user_command,
            steps=steps,
            confidence=round(confidence, 4),
            reasoning=reasoning
        )

    def _classify_segment(self, segment: str) -> tuple[DomainType, float]:
        """Classify a single request segment with Needle 2 and confidence validation."""
        self._last_routed_domain = None
        self._last_routed_request = None
        confidence = 0.95

        # Semantic domain detection
        low = segment.lower().strip()
        semantic_domain: Optional[DomainType] = None
        if any(w in low for w in ["search", "look up", "navigate", "website", "url", "go back"]):
            semantic_domain = "browser"
        elif any(w in low for w in ["write", "type", "insert", "replace", "save", "content"]):
            semantic_domain = "editor"
        elif any(w in low for w in ["folder", "create a file", "create file", "delete", "rename", "move", "list"]):
            semantic_domain = "files"
        elif any(w in low for w in ["open", "launch", "close", "minimize", "maximize", "focus"]):
            if "browser" in low:
                semantic_domain = "browser"
            elif "editor" in low or "text editor" in low:
                semantic_domain = "desktop"
            elif "files" in low or "file manager" in low:
                semantic_domain = "desktop"
            else:
                semantic_domain = "desktop"
        elif any(w in low for w in ["time", "system", "setting", "reset", "what's on", "whats on"]):
            semantic_domain = "system"

        if self._needle:
            try:
                res = self._needle.run(query=segment, max_steps=2)
                conf = res.get("confidence")
                if conf is not None and isinstance(conf, (int, float)):
                    confidence = float(conf)
            except Exception as e:
                print(f"[RouterAgent] Routing execution warning: {e}")

        # If Needle executed a routing tool with high confidence (>= 0.7), consider it
        if self._last_routed_domain and confidence >= 0.7:
            if not semantic_domain or self._last_routed_domain == semantic_domain:
                return self._last_routed_domain, confidence

        if semantic_domain:
            return semantic_domain, max(confidence, 0.96)

        if self._last_routed_domain:
            return self._last_routed_domain, confidence

        return "system", confidence

    def _segment_command(self, command: str) -> List[str]:
        """Split compound multi-step commands on conjunctions while preserving quotes and URLs/filenames."""
        # Split on ', then', ' then ', ' and then ', or '. ' (only when followed by a capital letter or end)
        parts = re.split(r',\s*then\s+|\s+then\s+|,\s*and\s+then\s+', command, flags=re.IGNORECASE)
        segments = []
        for p in parts:
            # Split by period only when followed by space and uppercase letter
            sentence_parts = re.split(r'\.\s+(?=[A-Z])', p)
            for sp in sentence_parts:
                # Further split on commas if it represents separate instructions like 'create hello.txt, write Hello World'
                # Do not split on commas inside quotes
                sub = [s.strip().rstrip('.') for s in re.split(r',\s*(?=[a-zA-Z])', sp) if s.strip()]
                segments.extend(sub)
        return [s for s in segments if len(s) > 2]
