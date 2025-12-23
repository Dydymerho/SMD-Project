import os
import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from app.schemas.ai_schema import (
    SummaryResponse, 
    CloPloCheckRequest, CloPloCheckResponse,
    DiffRequest, DiffResponse
)
from app.services.llm_service import llm_service
from app.services.file_reader import process_uploaded_file
from app.worker import process_ocr_task
router = APIRouter()
class OcrResponse(BaseModel):
    filename: str
    full_text: str
    message: str

class TaskResponse(BaseModel):
    task_id: str
    status: str
    message: str

@router.post("/extract-text", response_model=OcrResponse, summary="Extract Text Only")
async def extract_text_only(file: UploadFile = File(...)):
    """API nhận file PDF/Word -> Trả về Text (OCR/PdfReader)"""
    try:
        raw_text = await process_uploaded_file(file)
        return OcrResponse(
            filename=file.filename,
            full_text=raw_text,
            message="Đọc thành công"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-async", response_model=TaskResponse, summary="Upload Async (Worker)")
async def upload_async(file: UploadFile = File(...)):
    """Gửi file cho Worker xử lý ngầm (trả về Task ID)"""
    try:
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Gọi Worker
        task = process_ocr_task.delay(file_path)
        
        return TaskResponse(
            task_id=task.id, 
            status="Processing",
            message="Đã nhận file, đang xử lý ngầm."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. API TÓM TẮT (Summarize) - CÁI BẠN ĐANG THIẾU
@router.post("/summarize", response_model=SummaryResponse, summary="Summarize Syllabus")
async def summarize_syllabus(file: UploadFile = File(...)):
    """Upload file -> Trả về bản tóm tắt nội dung"""
    try:
        raw_text = await process_uploaded_file(file)
        # Cắt ngắn 12k ký tự để AI xử lý nhanh
        summary_text = await llm_service.generate_summary(raw_text[:12000])
        return SummaryResponse(summary=summary_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. API CHECK CLO-PLO - CÁI BẠN ĐANG THIẾU
@router.post("/check-clo-plo", response_model=CloPloCheckResponse, summary="Check CLO-PLO Alignment")
async def check_clo_plo(request: CloPloCheckRequest):
    """Kiểm tra độ khớp giữa Chuẩn đầu ra (CLO) và Chương trình (PLO)"""
    try:
        result = await llm_service.check_clo_plo_alignment(request.clo_text, request.plo_text)
        return CloPloCheckResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. API SO SÁNH (Diff)
@router.post("/analyze-diff", response_model=DiffResponse, summary="Analyze Diff")
async def analyze_diff(request: DiffRequest):
    """So sánh sự khác biệt giữa 2 đoạn văn bản"""
    try:
        analysis = await llm_service.analyze_changes(request.old_content, request.new_content)
        return DiffResponse(changes_analysis=analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))