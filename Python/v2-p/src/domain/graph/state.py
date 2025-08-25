from typing import TypedDict, Optional, List, Any, Dict

class AgentState(TypedDict):
    topic: str
    research_summary: str
    draft: str
    critique: str
    revision_number: int
    human_feedback: str
    # usage_stats: List[Dict]