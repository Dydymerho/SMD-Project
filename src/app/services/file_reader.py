import os
import shutil
import pytesseract
from pdf2image import convert_from_path
from fastapi import UploadFile
from docx import Document
from pypdf import PdfReader 

# --- CẤU HÌNH ĐƯỜNG DẪN ---
PATH_TO_TESSERACT = r'D:\AI SMD\tesseract.exe'
PATH_TO_TESSDATA = r'D:\AI SMD\tessdata'
PATH_TO_POPPLER = r'D:\AI SMD\poppler-24.02.0\Library\bin' 

# Config Tesseract
pytesseract.pytesseract.tesseract_cmd = PATH_TO_TESSERACT
os.environ['TESSDATA_PREFIX'] = PATH_TO_TESSDATA

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

def ocr_pdf_to_text(file_path: str) -> str:
    """Hàm OCR: Chỉ chạy khi file là ảnh/scan"""
    try:
        print(f"⚠️ PdfReader bó tay. Đang chạy OCR cho file: {file_path}...")
        pages = convert_from_path(file_path, dpi=300, poppler_path=PATH_TO_POPPLER)
        full_text = ""
        for i, page in enumerate(pages):
            text = pytesseract.image_to_string(page, lang='vie', config='--psm 6') 
            full_text += text + "\n"
        return full_text
    except Exception as e:
        print(f"Lỗi OCR: {e}")
        return ""

def read_file_from_path(file_path: str) -> str:
    """Hàm đọc file thông minh (Dùng chung cho cả API và Worker)"""
    content = ""
    try:
        if file_path.lower().endswith(".pdf"):
            # BƯỚC A: Thử đọc nhanh bằng pypdf
            try:
                reader = PdfReader(file_path)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        content += extracted + "\n"
            except Exception as e:
                print(f"PdfReader lỗi nhẹ: {e}, sẽ thử OCR sau.")

            # BƯỚC B: Nếu ít chữ quá -> Dùng OCR
            if len(content.strip()) < 50:
                content = ocr_pdf_to_text(file_path)
            else:
                print("✅ Đã đọc thành công bằng PdfReader (Siêu nhanh).")

        elif file_path.lower().endswith(".docx"):
            doc = Document(file_path)
            content = "\n".join([p.text for p in doc.paragraphs])
            
        return content
    except Exception as e:
        raise Exception(f"Lỗi đọc file: {str(e)}")

async def process_uploaded_file(file: UploadFile) -> str:
    """Hàm wrapper dùng cho API upload trực tiếp"""
    file_path = os.path.join(TEMP_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return read_file_from_path(file_path)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)