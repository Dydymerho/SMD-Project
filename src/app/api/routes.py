import os
import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File
from celery.result import AsyncResult # <--- Quan trọng để check trạng thái
from app.worker import celery_app # Import app để check status

# Import Schemas
from app.schemas.ai_schema import (
    CloPloCheckRequest, DiffRequest
)
from app.services.file_reader import process_uploaded_file

# Import Tasks từ Worker
from app.worker import (
    process_ocr_task, 
    task_summarize, 
    task_check_clo_plo, 
    task_diff
)

router = APIRouter()

# --- 1. API QUAN TRỌNG NHẤT: KIỂM TRA TRẠNG THÁI (POLLING) ---
@router.get("/task-status/{task_id}", summary="Check Task Status")
async def get_task_status(task_id: str):
    """
    Mobile App sẽ gọi API này liên tục (ví dụ 2s/lần) 
    để xem Worker đã làm xong chưa.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    response = {
        "task_id": task_id,
        "status": task_result.status, # PENDING, PROGRESS, SUCCESS, FAILURE
        "result": None
    }

    if task_result.state == 'PROGRESS':
        response["result"] = task_result.info.get('message', 'Đang xử lý...')
    
    elif task_result.state == 'SUCCESS':
        response["result"] = task_result.result # Kết quả cuối cùng (JSON)
        
    elif task_result.state == 'FAILURE':
        response["result"] = str(task_result.result)

    return response

# --- 2. API UPLOAD OCR (ASYNC) ---
@router.post("/upload-ocr-async", summary="Async OCR File")
async def upload_ocr_async(file: UploadFile = File(...)):
    try:
        # Lưu file tạm
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Gửi việc cho Worker
        task = process_ocr_task.delay(file_path)
        return {"task_id": task.id, "message": "Đã nhận file, đang OCR ngầm."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. API SUMMARIZE (ASYNC) ---
@router.post("/summarize-async", summary="Async Summarize")
async def summarize_async(file: UploadFile = File(...)):
    try:
        # Bước 1: Đọc file text ngay tại API (vì file text nhẹ)
        # Nếu file quá nặng thì nên đẩy path xuống worker như OCR
        raw_text = await process_uploaded_file(file)
        
        # Bước 2: Đẩy text xuống Worker để AI tóm tắt
        task = task_summarize.delay(raw_text[:15000]) # Cắt bớt nếu quá dài
        
        return {"task_id": task.id, "message": "Đã nhận văn bản, đang tóm tắt ngầm."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. API CHECK CLO-PLO (ASYNC) ---
@router.post("/check-clo-plo-async", summary="Async Check CLO-PLO")
async def check_clo_plo_async(request: CloPloCheckRequest):
    # Đẩy việc luôn, không cần chờ
    task = task_check_clo_plo.delay(request.clo_text, request.plo_text)
    return {"task_id": task.id, "message": "Đang kiểm tra sự phù hợp."}

# --- 5. API DIFF (ASYNC) ---
@router.post("/analyze-diff-async", summary="Async Analyze Diff")
async def analyze_diff_async(request: DiffRequest):
    task = task_diff.delay(request.old_content, request.new_content)
    return {"task_id": task.id, "message": "Đang so sánh văn bản."}