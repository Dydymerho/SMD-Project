from pydantic import BaseModel
from typing import Optional

# --- 1. MODEL CHO API TÓM TẮT (Cái bạn đang thiếu) ---
class SummaryResponse(BaseModel):
    summary: str

# --- 2. MODEL CHO API CHECK CLO-PLO ---
class CloPloCheckRequest(BaseModel):
    clo_text: str
    plo_text: str

class CloPloCheckResponse(BaseModel):
    score: int          # Điểm số tương thích (0-100)
    reasoning: str      # Giải thích
    is_aligned: bool    # Đạt hay không

# --- 3. MODEL CHO API SO SÁNH (DIFF) ---
class DiffRequest(BaseModel):
    old_content: str
    new_content: str

class DiffResponse(BaseModel):
    changes_analysis: str