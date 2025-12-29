import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer, util
import difflib

# Load model (Sẽ tải về lần đầu chạy, khoảng 80MB)
try:
    print("⏳ Đang load BERT Model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Load BERT Model thành công!")
except Exception as e:
    print(f"❌ Lỗi load model BERT: {e}")
    model = None

def extract_text_from_pdf(file_bytes):
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Lỗi đọc PDF: {e}")
        return ""

def calculate_similarity(text1, text2):
    """Trả về độ tương đồng (0.0 đến 1.0)"""
    if model is None:
        return 0.0
    
    # Encode
    embeddings1 = model.encode(text1, convert_to_tensor=True)
    embeddings2 = model.encode(text2, convert_to_tensor=True)
    
    # Cosine Similarity
    score = util.cos_sim(embeddings1, embeddings2)
    return float(score[0][0])

def get_diff_highlight(text1, text2):
    """Trả về list các dòng diff để Frontend tô màu"""
    d = difflib.Differ()
    # Tách dòng
    lines1 = text1.splitlines()
    lines2 = text2.splitlines()
    
    diff = list(d.compare(lines1, lines2))
    
    result = []
    for line in diff:
        code = line[:2]
        content = line[2:]
        
        if code == '+ ':
            result.append({"type": "added", "content": content})
        elif code == '- ':
            result.append({"type": "removed", "content": content})
        elif code == '? ':
            continue
        else:
            result.append({"type": "unchanged", "content": content})
            
    return result