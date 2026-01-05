import os
import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File
from celery.result import AsyncResult
from app.worker import celery_app

# Import Schemas
from app.schemas.ai_schema import (
    CloPloCheckRequest, DiffRequest
)
from app.services.file_reader import process_uploaded_file

# Import Tasks
from app.worker import (
    process_ocr_task, 
    task_summarize, 
    task_check_clo_plo, 
    task_diff
)

router = APIRouter()

# --- 1. CHECK STATUS ---
@router.get("/task-status/{task_id}", summary="Check Task Status")
async def get_task_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    response = {
        "task_id": task_id,
        "status": task_result.status,
        "result": None
    }
    if task_result.state == 'PROGRESS':
        response["result"] = task_result.info.get('message', 'Đang xử lý...')
    elif task_result.state == 'SUCCESS':
        response["result"] = task_result.result
    elif task_result.state == 'FAILURE':
        response["result"] = str(task_result.result)
    return response

# --- 2. UPLOAD OCR ---
@router.post("/upload-ocr-async", summary="Async OCR File")
async def upload_ocr_async(file: UploadFile = File(...)):
    try:
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        task = process_ocr_task.delay(file_path)
        return {"task_id": task.id, "message": "Đã nhận file, đang OCR ngầm."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. SUMMARIZE ---
@router.post("/summarize-async", summary="Async Summarize")
async def summarize_async(file: UploadFile = File(...)):
    try:
        raw_text = await process_uploaded_file(file)
        task = task_summarize.delay(raw_text[:15000])
        return {"task_id": task.id, "message": "Đã nhận văn bản, đang tóm tắt ngầm."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. CHECK CLO-PLO ---
@router.post("/check-clo-plo-async", summary="Async Check CLO-PLO")
async def check_clo_plo_async(request: CloPloCheckRequest):
    task = task_check_clo_plo.delay(request.clo_text, request.plo_text)
    return {"task_id": task.id, "message": "Đang kiểm tra sự phù hợp."}

# --- 5. COMPARE SYLLABUS (Đã đổi tên và kích hoạt BERT) ---
@router.post("/syllabus/compare", summary="Compare 2 Syllabus (BERT + Highlight)")
async def compare_syllabus_async(request: DiffRequest):
    """
    So sánh 2 văn bản dùng BERT (tính điểm) và DiffLib (tô màu).
    Kết quả trả về qua API /task-status/{task_id}
    """
    task = task_diff.delay(request.old_content, request.new_content)
    return {"task_id": task.id, "message": "Đang chạy so sánh (BERT & Highlight)..."}