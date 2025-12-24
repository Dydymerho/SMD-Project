from fastapi import FastAPI
from app.api.routes import router as ai_router
# from app.core.config import settings # (Tạm bỏ qua nếu chưa cần config phức tạp)

app = FastAPI(title="SMD AI Microservice")

# Include router
app.include_router(ai_router, prefix="/api/v1/ai", tags=["AI Processing"])

@app.get("/")
def health_check():
    return {"status": "ok", "service": "SMD AI Microservice"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)