# 1. Dùng Python 3.11
FROM python:3.11-slim

# 2. Cài đặt thư viện hệ thống cần thiết cho OCR (Linux)
RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-vie \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# 3. Thiết lập thư mục làm việc bên trong Docker
WORKDIR /app

# 4. Copy file thư viện và cài đặt
COPY requirements.txt .
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt

# 5. COPY TOÀN BỘ CODE TỪ FOLDER 'src' VÀO TRONG '/app'
# (Lúc này main.py sẽ nằm ngay tại /app/main.py)
COPY src/ .

# 6. Tạo thư mục temp
RUN mkdir -p temp_uploads

# 7. Lệnh chạy mặc định (nếu chạy lẻ)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]