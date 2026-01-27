from sentence_transformers import SentenceTransformer, util
import difflib

# Load Model một lần duy nhất khi khởi động để tiết kiệm thời gian
try:
    print("Đang load BERT Model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Load BERT Model thành công!")
except Exception as e:
    print(f"❌ Lỗi load model BERT: {e}")
    model = None

def calculate_similarity(text1: str, text2: str) -> float:
    """Trả về độ tương đồng (0.0 đến 1.0)"""
    if model is None or not text1 or not text2:
        return 0.0
    
    # Encode sang vector và so sánh Cosine Similarity
    embeddings1 = model.encode(text1, convert_to_tensor=True)
    embeddings2 = model.encode(text2, convert_to_tensor=True)
    
    score = util.cos_sim(embeddings1, embeddings2)
    return float(score[0][0])

def get_diff_highlight(text1: str, text2: str) -> list:
    """Trả về danh sách các dòng khác biệt để Frontend tô màu"""
    d = difflib.Differ()
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