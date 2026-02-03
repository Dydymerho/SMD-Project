import os
import json
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.schemas.ai_schema import CloPloCheckResponse, SyllabusExtractResponse

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

class LLMService:
    def __init__(self):
        print(f"Đang kết nối AI tại: {OLLAMA_BASE_URL}") 
        
        self.llm_json = OllamaLLM(
            base_url=OLLAMA_BASE_URL,
            model="llama3", 
            temperature=0.1, 
            format="json",   
            num_ctx=8192, 
            keep_alive="5m"
        )

        self.llm_text = OllamaLLM(
            base_url=OLLAMA_BASE_URL,
            model="llama3", 
            temperature=0.7, 
            num_ctx=8192, 
            keep_alive="5m"
        )

    async def generate_summary_from_json(self, data: dict) -> str:
        json_str = json.dumps(data, ensure_ascii=False, indent=2)
        
        template = """
        Bạn là trợ lý học thuật. Hãy đọc dữ liệu JSON đề cương môn học dưới đây và viết một đoạn tóm tắt hay.
        
        DỮ LIỆU ĐỀ CƯƠNG (JSON):
        {json_str}
        
        YÊU CẦU:
        - Tóm tắt ngắn gọn các thông tin chính: Tên môn, Mục tiêu, Nội dung chính, Cách đánh giá.
        - Viết bằng văn phong tự nhiên, trôi chảy (không liệt kê gạch đầu dòng khô khan).
        - Ngôn ngữ: Tiếng Việt.
        
        BẢN TÓM TẮT:
        """
        
        prompt = PromptTemplate(template=template, input_variables=["json_str"])
        
        chain = prompt | self.llm_text
        result = await chain.ainvoke({"json_str": json_str})
        return result

    async def check_clo_plo_alignment(self, clo: str, plo: str) -> dict:
        parser = JsonOutputParser(pydantic_object=CloPloCheckResponse)
        template = """
        Bạn là chuyên gia kiểm định giáo dục. Đánh giá mức độ phù hợp giữa CLO và PLO.
        CLO: {clo}
        PLO: {plo}
        
        Hãy trả về 1 JSON duy nhất gồm: 
        - score (int 0-100)
        - is_aligned (boolean)
        - reasoning (string tiếng Việt giải thích ngắn gọn)
        
        {format_instructions}
        """
        prompt = PromptTemplate(
            template=template,
            input_variables=["clo", "plo"],
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        
        chain = prompt | self.llm_json | parser
        try:
            return await chain.ainvoke({"clo": clo, "plo": plo})
        except Exception as e:
            return {"score": 0, "is_aligned": False, "reasoning": f"Lỗi: {str(e)}"}

    async def analyze_changes(self, old_text: str, new_text: str) -> str:
        template = """
        Bạn là trợ lý ảo để so sánh hai đề cương.
        Nhiệm vụ: So sánh hai đề cương này bằng TIẾNG VIỆT.
        YÊU CẦU: TUYỆT ĐỐI CHỈ TRẢ LỜI BẰNG TIẾNG VIỆT, KHÔNG CHÀO HỎI, ĐI THẲNG VÀO VẤN ĐỀ.

        --- BẢN CŨ ---
        {old_text}
        
        --- BẢN MỚI ---
        {new_text}
        
        Kết quả phân tích thay đổi:
        """
        prompt = PromptTemplate(template=template, input_variables=["old_text", "new_text"])
        
        chain = prompt | self.llm_text
        result = await chain.ainvoke({"old_text": old_text, "new_text": new_text})
        return result

    def normalize_syllabus_data(self, data: dict) -> dict:
        """Làm sạch dữ liệu, đảm bảo không bị None"""
        list_fields = ["target", "sessionPlans", "assessments", "materials", "courseRelations"]
        
        for field in list_fields:
            if field not in data or data[field] is None:
                data[field] = []
        
        str_fields = ["courseCode", "courseName", "description", "lecturerName"]
        for field in str_fields:
            if field not in data or data[field] is None:
                data[field] = ""
                
        return data

    async def extract_syllabus_info(self, text_content: str) -> dict:
        print(f"DEBUG: Độ dài văn bản OCR: {len(text_content)} ký tự")
        template = """
        Bạn là chuyên gia trích xuất dữ liệu giáo dục.
        Nhiệm vụ: Trích xuất thông tin từ văn bản OCR bên dưới thành JSON.
        
        VĂN BẢN ĐẦU VÀO:
        {text_content}
        
        YÊU CẦU BẮT BUỘC:
        1. Chỉ trả về 1 JSON duy nhất.
        2. Nếu không tìm thấy thông tin, hãy để chuỗi rỗng "" hoặc mảng rỗng [].
        3. Dịch các nội dung sang Tiếng Việt nếu cần.
        
        CẤU TRÚC JSON KẾT QUẢ (Hãy điền vào đây):
        {{
            "courseCode": "Mã môn học (Ví dụ: IE101)",
            "courseName": "Tên môn học đầy đủ",
            "deptName": "Khoa hoặc Bộ môn phụ trách",
            "lecturerName": "Tên giảng viên",
            "credit": 0,
            "academicYear": "Năm học",
            "type": "Loại môn (Bắt buộc/Tự chọn)",
            "description": "Mô tả tóm tắt nội dung môn học",
            "target": ["Mục tiêu 1", "Mục tiêu 2"], 
            "sessionPlans": [
                {{ "weekNo": 1, "topic": "Chủ đề bài học", "teachingMethod": "Lý thuyết/Thực hành" }}
            ],
            "assessments": [
                {{ "name": "Tên bài thi (Giữa kỳ/Cuối kỳ)", "weightPercent": 0, "criteria": "Hình thức thi" }}
            ],
            "materials": [
                {{ "title": "Tên sách", "author": "Tác giả", "materialType": "Giáo trình/Tham khảo" }}
            ],
            "courseRelations": []
        }}
        """
        
        prompt = PromptTemplate(template=template, input_variables=["text_content"])
        
        try:
            print("DEBUG: Đang gửi request sang Ollama...")
            safe_text = text_content[:15000]
            chain = prompt | self.llm_json
            raw_response = await chain.ainvoke({"text_content": safe_text})
            print(f"DEBUG: AI Response: {raw_response[:200]}...") 
            try:
                start = raw_response.find('{')
                end = raw_response.rfind('}') + 1
                if start != -1 and end != -1:
                    json_str = raw_response[start:end]
                    parsed_result = json.loads(json_str)
                else:
                    parsed_result = json.loads(raw_response)
            except json.JSONDecodeError:
                print("Lỗi: AI trả về không phải JSON hợp lệ.")
                return SyllabusExtractResponse().dict()
                
            final_result = self.normalize_syllabus_data(parsed_result)
            return final_result
            
        except Exception as e:
            print(f"Lỗi xử lý AI: {str(e)}")
            import traceback
            traceback.print_exc()
            return SyllabusExtractResponse().dict()
        
    async def compare_syllabus_json_structure(self, old_json: dict, new_json: dict) -> dict:
        old_str = json.dumps(old_json, ensure_ascii=False, indent=2)
        new_str = json.dumps(new_json, ensure_ascii=False, indent=2)

        template = """
        Bạn là trợ lý so sánh dữ liệu giáo dục.
        NHIỆM VỤ: So sánh hai đề cương môn học (JSON) dưới đây và chỉ ra sự thay đổi.
        
        --- ĐỀ CƯƠNG CŨ ---
        {old_str}
        
        --- ĐỀ CƯƠNG MỚI ---
        {new_str}
        
        HÃY TRẢ VỀ JSON PHÂN TÍCH (Tiếng Việt):
        {{
            "similarity_percent": 80,
            "summary_changes": "Tóm tắt các thay đổi chính...",
            "details": [
                {{ "field": "Tên trường", "status": "Thay đổi/Mới/Xóa", "old": "Giá trị cũ", "new": "Giá trị mới", "description": "Diễn giải" }}
            ]
        }}
        """
        prompt = PromptTemplate(template=template, input_variables=["old_str", "new_str"])
        
        chain = prompt | self.llm_json 
        
        try:
            res_str = await chain.ainvoke({"old_str": old_str, "new_str": new_str})
            if isinstance(res_str, str):
                 start = res_str.find('{')
                 end = res_str.rfind('}') + 1
                 if start != -1:
                     return json.loads(res_str[start:end])
                 return json.loads(res_str)
            return res_str
        except Exception as e:
            return {"error": str(e), "message": "Lỗi khi so sánh JSON"}