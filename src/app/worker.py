import os
import asyncio
from celery import Celery
from app.services.file_reader import read_file_from_path
# --- QUAN TRỌNG: Import Class chứ không import biến instance ---
from app.services.llm_service import LLMService 

# Cấu hình Redis
REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "smd_ai_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Ho_Chi_Minh",
    enable_utc=True,
    task_track_started=True,
)

# --- TASK 1: XỬ LÝ OCR ---
@celery_app.task(name="app.worker.process_ocr_task", bind=True)
def process_ocr_task(self, file_path: str):
    try:
        self.update_state(state='PROGRESS', meta={'message': 'Đang đọc tài liệu...'})
        full_text = read_file_from_path(file_path)
        
        if not full_text.strip():
            return {"status": "Failed", "error": "File rỗng"}
            
        if os.path.exists(file_path):
            os.remove(file_path)

        return {
            "status": "Success", 
            "filename": os.path.basename(file_path),
            "extracted_text": full_text
        }
    except Exception as e:
        return {"status": "Failed", "error": str(e)}

# --- TASK 2: TÓM TẮT (Summarize) ---
@celery_app.task(name="app.worker.task_summarize", bind=True)
def task_summarize(self, text: str):
    try:
        self.update_state(state='PROGRESS', meta={'message': 'AI đang đọc và tóm tắt...'})
        
        # [FIX LỖI EVENT LOOP] Khởi tạo service mới ngay trong task
        service = LLMService()
        
        result = asyncio.run(service.generate_summary(text))
        return {"status": "Success", "summary": result}
    except Exception as e:
        return {"status": "Failed", "error": str(e)}

# --- TASK 3: CHECK CLO-PLO ---
@celery_app.task(name="app.worker.task_check_clo_plo", bind=True)
def task_check_clo_plo(self, clo: str, plo: str):
    try:
        self.update_state(state='PROGRESS', meta={'message': 'AI đang đánh giá độ khớp...'})
        
        # [FIX LỖI EVENT LOOP] Khởi tạo service mới
        service = LLMService()
        
        result = asyncio.run(service.check_clo_plo_alignment(clo, plo))
        return {"status": "Success", "data": result}
    except Exception as e:
        return {"status": "Failed", "error": str(e)}

# --- TASK 4: SO SÁNH (Diff) ---
@celery_app.task(name="app.worker.task_diff", bind=True)
def task_diff(self, old_text: str, new_text: str):
    try:
        self.update_state(state='PROGRESS', meta={'message': 'AI đang so sánh văn bản...'})
        
        # [FIX LỖI EVENT LOOP] Khởi tạo service mới
        service = LLMService()
        
        result = asyncio.run(service.analyze_changes(old_text, new_text))
        return {"status": "Success", "analysis": result}
    except Exception as e:
        return {"status": "Failed", "error": str(e)}