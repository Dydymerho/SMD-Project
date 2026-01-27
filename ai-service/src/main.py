import uvicorn
import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from app.core.config import settings
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

TEMP_DIR = BASE_DIR / "app" / "services" / "temp_uploads" 
TEMP_DIR.mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API Extract, Compare Syllabus, CLO, PLO",
    version="1.3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


try:
    from app.api import routes as api_routes
    
    app.include_router(api_routes.router)
    
    print("[SUCCESS] Đã load module API từ app/api/routes.py")

except ImportError as e:
    print(f"[LỖI IMPORT] Không tìm thấy module: {e}")
    print("Hãy kiểm tra file app/api/routes.py xem có lỗi cú pháp không.")
except AttributeError as e:
    print(f"[LỖI TÊN ROUTER] {e}")
    print("Trong file 'app/api/routes.py', bạn có khai báo biến 'router = APIRouter(...)' không?")

@app.get("/", tags=["Health Check"])
async def health_check():
    return {"status": "active", "message": "Server running with routers from app/api/routes.py"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)