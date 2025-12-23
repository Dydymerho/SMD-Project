import os
import asyncio
from celery import Celery
from app.services.file_reader import read_file_from_path
from app.services.llm_service import llm_service

# Redis URL (Để localhost vì bạn chạy Redis Docker port 6379)
REDIS_URL = "redis://localhost:6379/0"

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

@celery_app.task(name="app.worker.process_ocr_task", bind=True)
def process_ocr_task(self, file_path: str):
    """Worker xử lý ngầm"""
    try:
        print(f"Worker start: {file_path}")
        self.update_state(state='PROGRESS', meta={'message': 'Đang đọc tài liệu...'})

        full_text = read_file_from_path(file_path)
        
        if not full_text.strip():
            return {"status": "Failed", "error": "File rỗng hoặc không đọc được chữ"}

        self.update_state(state='PROGRESS', meta={'message': 'Đang tóm tắt...'})
        
        summary = ""
        try:
            # Asyncio run để gọi hàm async trong môi trường sync
            summary = asyncio.run(llm_service.generate_summary(full_text[:15000]))
        except Exception as e:
            print(f"Lỗi AI: {e}")
            summary = "Lỗi khi gọi AI tóm tắt."

        if os.path.exists(file_path):
            os.remove(file_path)

        print(f"✅ Xử lý xong file: {file_path}")
        return {
            "status": "Success",
            "filename": os.path.basename(file_path),
            "full_text": full_text,
            "summary": summary
        }

    except Exception as e:
        print(f"Worker lỗi: {e}")
        return {"status": "Failed", "error": str(e)}