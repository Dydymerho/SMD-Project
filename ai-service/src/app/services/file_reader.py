import os
import docx
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import platform

# Cấu hình đường dẫn Tesseract/Poppler (chỉ cần thiết cho Windows)
if platform.system() == "Windows":
    # LƯU Ý: Đảm bảo đường dẫn này đúng trên máy bạn
    pytesseract.pytesseract.tesseract_cmd = r'D:\AI SMD\tesseract.exe'
    os.environ['TESSDATA_PREFIX'] = r'D:\AI SMD\tessdata'
    PATH_TO_POPPLER = r'D:\AI SMD\poppler-24.02.0\Library\bin'
else:
    PATH_TO_POPPLER = None 

def ocr_mixed_file(file_path: str) -> str:
    """
    Hàm ĐA NĂNG: Đọc nội dung từ file Ảnh (.jpg, .png), PDF (.pdf) và Word (.docx).
    Trả về: Chuỗi văn bản (String).
    """
    try:
        text_result = ""
        file_lower = file_path.lower()

        # 1. Xử lý FILE ẢNH (OCR)
        if file_lower.endswith(('.png', '.jpg', '.jpeg')):
            image = Image.open(file_path)
            text_result = pytesseract.image_to_string(image, lang='vie')

        # 2. Xử lý FILE PDF (Chuyển sang ảnh -> OCR)
        elif file_lower.endswith('.pdf'):
            # dpi=300 để đọc rõ chữ nhỏ
            pages = convert_from_path(file_path, dpi=300, poppler_path=PATH_TO_POPPLER)
            for page in pages:
                text_result += pytesseract.image_to_string(page, lang='vie') + "\n"

        # 3. Xử lý FILE WORD (Đọc trực tiếp text)
        elif file_lower.endswith('.docx'):
            doc = docx.Document(file_path)
            text_result = "\n".join([para.text for para in doc.paragraphs])
            
        else:
            return "Lỗi: Định dạng file không hỗ trợ (Chỉ nhận JPG, PNG, PDF, DOCX)"

        return text_result.strip()

    except Exception as e:
        print(f"Lỗi đọc file {file_path}: {e}")
        return ""