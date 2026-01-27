from pydantic import BaseModel
from typing import Optional, List, Any

class SummaryResponse(BaseModel):
    summary: str

class CloPloCheckRequest(BaseModel):
    clo_text: str
    plo_text: str

class CloPloCheckResponse(BaseModel):
    score: int
    reasoning: str
    is_aligned: bool

class DiffRequest(BaseModel):
    old_content: str
    new_content: str

class HighlightItem(BaseModel):
    type: str 
    content: str

class DiffResponse(BaseModel):
    similarity_percent: float
    ai_analysis: str
    highlight_data: List[HighlightItem]