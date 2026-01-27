from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from celery.result import AsyncResult
from app.worker import celery_app, process_ocr_task, task_summarize, task_check_clo_plo, task_diff
from app.schemas.ai_schema import CloPloCheckRequest

router = APIRouter()

# --- 1. API CHECK TRẠNG THÁI TASK ---
@router.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    return {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else task_result.info
    }

# --- 2. API OCR ---
@router.post("/upload-ocr-async")
async def upload_ocr(file: UploadFile = File(...)):
    content = await file.read()
    if not content: raise HTTPException(400, "File rỗng")
    
    task = process_ocr_task.delay(content, file.filename)
    return {"task_id": task.id, "message": "Đang OCR..."}

# --- 3. API TÓM TẮT (SUMMARIZE) - Đã hỗ trợ File ---
@router.post("/summarize-async")
async def summarize_async(file: UploadFile = File(...)):
    """Backend gửi file (PDF/Ảnh/Word) để tóm tắt"""
    content = await file.read()
    if not content: raise HTTPException(400, "File rỗng")
    
    task = task_summarize.delay(content, file.filename)
    return {"task_id": task.id, "message": "Đang tóm tắt..."}

# --- 4. API SO SÁNH (COMPARE) - Đã hỗ trợ 2 File ---
@router.post("/syllabus/compare")
async def compare_syllabus_async(
    file_old: UploadFile = File(...),
    file_new: UploadFile = File(...)
):
    """Backend gửi 2 file để so sánh"""
    c_old = await file_old.read()
    c_new = await file_new.read()
    
    if not c_old or not c_new: raise HTTPException(400, "Thiếu file")

    task = task_diff.delay(c_old, file_old.filename, c_new, file_new.filename)
    return {"task_id": task.id, "message": "Đang so sánh..."}

# --- 5. CHECK CLO-PLO (Vẫn giữ JSON vì dữ liệu ngắn) ---
# Tìm và thay thế đoạn check_clo_plo_async cũ bằng đoạn này:

@router.post("/check-clo-plo-async", summary="Async Check CLO-PLO (From Files)")
async def check_clo_plo_async(
    file_clo: UploadFile = File(...),
    file_plo: UploadFile = File(...)
):
    """
    Nhận 2 file (Ảnh/PDF/Word) chứa nội dung CLO và PLO để kiểm tra độ khớp.
    """
    # 1. Đọc bytes
    clo_bytes = await file_clo.read()
    plo_bytes = await file_plo.read()
    
    # 2. Validate
    if not clo_bytes or not plo_bytes:
        raise HTTPException(status_code=400, detail="File tải lên bị rỗng")

    # 3. Gửi sang Worker
    task = task_check_clo_plo.delay(
        clo_bytes, file_clo.filename,
        plo_bytes, file_plo.filename
    )
    
    return {"task_id": task.id, "message": "Đang đọc file và kiểm tra sự phù hợp..."}