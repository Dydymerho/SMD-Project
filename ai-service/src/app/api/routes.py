from fastapi import APIRouter, HTTPException, UploadFile, File
from celery.result import AsyncResult
from app.worker import celery_app, process_ocr_task, task_diff_text, task_summarize_text, task_check_clo_plo, task_diff, task_extract_syllabus_json, task_compare_json_syllabus
from app.schemas.ai_schema import CloPloCheckRequest, SummaryRequest, DiffRequest, ExtractSyllabusRequest, CompareSyllabusJsonRequest

router = APIRouter()

@router.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    return {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else task_result.info
    }

@router.post("/upload-ocr-async")
async def upload_ocr(file: UploadFile = File(...)):
    content = await file.read()
    if not content: raise HTTPException(400, "File rỗng")
    task = process_ocr_task.delay(content, file.filename)
    return {"task_id": task.id, "message": "Đang OCR..."}

@router.post("/summarize-text")
async def summarize_text(req: SummaryRequest):
    """
    Nhận input JSON: { "text": "Nội dung cần tóm tắt..." }
    """
    if not req.text: raise HTTPException(400, "Văn bản rỗng")
    task = task_summarize_text.delay(req.text)
    return {"task_id": task.id, "message": "Đang tóm tắt văn bản..."}

@router.post("/syllabus/compare")
async def compare_syllabus_text(req: DiffRequest):
    """
    So sánh text trực tiếp (giống như summarize-text)
    """
    if not req.old_content or not req.new_content:
        raise HTTPException(400, "Văn bản rỗng")
        
    # Gọi task mới vừa thêm
    task = task_diff_text.delay(req.old_content, req.new_content)
    return {"task_id": task.id, "message": "Đang so sánh..."}


@router.post("/check-clo-plo-async", summary="Async Check CLO-PLO (From Files)")
async def check_clo_plo_async(
    file_clo: UploadFile = File(...),
    file_plo: UploadFile = File(...)
):
    """
    Nhận 2 file (Ảnh/PDF/Word) chứa nội dung CLO và PLO để kiểm tra độ khớp.
    """
    clo_bytes = await file_clo.read()
    plo_bytes = await file_plo.read()
    
    if not clo_bytes or not plo_bytes:
        raise HTTPException(status_code=400, detail="File tải lên bị rỗng")

    task = task_check_clo_plo.delay(
        clo_bytes, file_clo.filename,
        plo_bytes, file_plo.filename
    )
    
    return {"task_id": task.id, "message": "Đang đọc file và kiểm tra sự phù hợp..."}


@router.post("/extract-syllabus-json")
async def extract_syllabus_json(req: ExtractSyllabusRequest):
    """
    Input: JSON Object (theo form syl1.json)
    Output: Task ID -> Kết quả là JSON Form Target chuẩn.
    """
    if not req.syllabus_data: 
        raise HTTPException(400, "Dữ liệu JSON rỗng")
    task = task_extract_syllabus_json.delay(req.syllabus_data)
    return {"task_id": task.id, "message": "Đang xử lý và chuẩn hóa JSON..."}


@router.post("/syllabus/compare-json")
async def compare_syllabus_json(req: CompareSyllabusJsonRequest):
    """
    So sánh 2 JSON Syllabus (MỚI)
    """
    if not req.old_syllabus or not req.new_syllabus:
        raise HTTPException(400, "Dữ liệu JSON bị thiếu")

    task = task_compare_json_syllabus.delay(req.old_syllabus, req.new_syllabus)
    return {"task_id": task.id, "message": "Đang phân tích sự khác biệt..."}