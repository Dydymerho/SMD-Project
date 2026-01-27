import os
import asyncio
from celery import Celery
from app.services.llm_service import LLMService 
from app.services import syllabus_service
from app.services.file_reader import ocr_mixed_file

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

def save_temp_file(content_bytes, filename, task_id):
    temp_path = f"/tmp/{task_id}_{filename}"
    with open(temp_path, "wb") as f:
        f.write(content_bytes)
    return temp_path

@celery_app.task(name="app.worker.process_ocr_task", bind=True)
def process_ocr_task(self, file_content, filename):  
    path = save_temp_file(file_content, filename, self.request.id)
    try:
        text = ocr_mixed_file(path)
        return {"status": "Done", "text": text}
    except Exception as e:
        return {"status": "Failed", "error": str(e)}
    finally:
        if os.path.exists(path): os.remove(path)

@celery_app.task(name="app.worker.task_summarize", bind=True)
def task_summarize(self, file_content, filename):
    path = save_temp_file(file_content, filename, self.request.id)
    try:
        text = ocr_mixed_file(path)
        if len(text) < 10:
            return {"status": "Failed", "error": "File rỗng hoặc không đọc được chữ"}

        llm = LLMService()
        summary = asyncio.run(llm.generate_summary(text[:15000])) # Cắt bớt nếu quá dài
        
        return {"status": "Success", "summary": summary}
    except Exception as e:
        return {"status": "Failed", "error": str(e)}
    finally:
        if os.path.exists(path): os.remove(path)

@celery_app.task(name="app.worker.task_diff", bind=True)
def task_diff(self, old_bytes, old_name, new_bytes, new_name):
    path_old = save_temp_file(old_bytes, old_name, self.request.id + "_old")
    path_new = save_temp_file(new_bytes, new_name, self.request.id + "_new")
    
    try:
        self.update_state(state='PROGRESS', meta={'message': 'Đang đọc và OCR dữ liệu...'})
        text_old = ocr_mixed_file(path_old)
        text_new = ocr_mixed_file(path_new)

        if not text_old.strip() or not text_new.strip():
            return {"status": "Failed", "error": "Không đọc được nội dung từ file tải lên"}

        self.update_state(state='PROGRESS', meta={'message': 'Đang tính điểm tương đồng...'})
        score = syllabus_service.calculate_similarity(text_old, text_new)
        
        self.update_state(state='PROGRESS', meta={'message': 'Đang so sánh chi tiết...'})
        highlights = syllabus_service.get_diff_highlight(text_old, text_new)
        
        self.update_state(state='PROGRESS', meta={'message': 'AI đang phân tích...'})
        llm = LLMService()
        analysis = asyncio.run(llm.analyze_changes(text_old, text_new))
        
        return {
            "status": "Success", 
            "similarity_percent": round(score * 100, 2),
            "highlight_data": highlights, 
            "ai_analysis": analysis
        }
    except Exception as e:
        return {"status": "Failed", "error": str(e)}
    finally:
        if os.path.exists(path_old): os.remove(path_old)
        if os.path.exists(path_new): os.remove(path_new)


@celery_app.task(name="app.worker.task_check_clo_plo", bind=True)
def task_check_clo_plo(self, clo_bytes, clo_filename, plo_bytes, plo_filename):
    path_clo = save_temp_file(clo_bytes, clo_filename, self.request.id + "_clo")
    path_plo = save_temp_file(plo_bytes, plo_filename, self.request.id + "_plo")
    
    try:
        self.update_state(state='PROGRESS', meta={'message': 'Đang đọc dữ liệu từ file...'})

        clo_text = ocr_mixed_file(path_clo)
        plo_text = ocr_mixed_file(path_plo)

        if not clo_text.strip() or not plo_text.strip():
            return {"status": "Failed", "error": "Không đọc được nội dung (File rỗng hoặc ảnh quá mờ)"}

        self.update_state(state='PROGRESS', meta={'message': 'AI đang đánh giá độ khớp...'})
        service = LLMService()
        result = asyncio.run(service.check_clo_plo_alignment(clo_text, plo_text))
        
        return {"status": "Success", "data": result}

    except Exception as e:
        return {"status": "Failed", "error": str(e)}
    finally:
        if os.path.exists(path_clo): os.remove(path_clo)
        if os.path.exists(path_plo): os.remove(path_plo)