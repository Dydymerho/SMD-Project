import os
import json
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.schemas.ai_schema import CloPloCheckResponse, SyllabusExtractResponse

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3"

class LLMService:
    def __init__(self):
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        print(f"Đang kết nối AI tại: {base_url}") 
        self.llm = OllamaLLM(
            base_url=base_url,
            model="llama3", 
            temperature=0.1, 
            format="json",
            num_ctx=8192, 
            num_predict=4096,
            keep_alive="5m"
        )

    async def generate_summary(self, text: str) -> str:
        template = """
        Bạn là một trợ lý AI học thuật chuyên nghiệp.
        Hãy tóm tắt nội dung đề cương môn học sau đây một cách ngắn gọn, súc tích bằng Tiếng Việt.
        
        Nội dung: {text}
        
        Tóm tắt (Tiếng Việt):
        """
        prompt = PromptTemplate(template=template, input_variables=["text"])
        chain = prompt | self.llm
        result = await chain.ainvoke({"text": text})
        return result

    async def check_clo_plo_alignment(self, clo: str, plo: str) -> dict:
        parser = JsonOutputParser(pydantic_object=CloPloCheckResponse)
        template = """
        Bạn là chuyên gia kiểm định giáo dục. Đánh giá mức độ phù hợp giữa CLO và PLO.
        CLO: {clo}
        PLO: {plo}
        Trả về JSON: score (0-100), is_aligned (bool), reasoning (Tiếng Việt).
        {format_instructions}
        """
        prompt = PromptTemplate(
            template=template,
            input_variables=["clo", "plo"],
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        chain = prompt | self.llm | parser
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
        chain = prompt | self.llm
        result = await chain.ainvoke({"old_text": old_text, "new_text": new_text})
        return result
    def normalize_syllabus_data(self, data: dict, original_input: dict) -> dict:
        """Sửa lỗi key và điền thiếu dữ liệu"""
        if "sessionPlans" in data and isinstance(data["sessionPlans"], list):
            for plan in data["sessionPlans"]:
                keys_to_fix = ["=>", "content", "description", "nội dung"]
                for k in keys_to_fix:
                    if k in plan:
                        plan["topic"] = plan[k]
                        del plan[k]
                
                if "topic" not in plan:
                    plan["topic"] = "Nội dung bài học"
                if "teachingMethod" not in plan or not plan["teachingMethod"]:
                    plan["teachingMethod"] = "Thuyết giảng"
        
        if (not data.get("target")) and original_input.get("target"):
             data["target"] = original_input["target"]

        for list_field in ["target", "sessionPlans", "assessments", "materials", "courseRelations"]:
            if list_field not in data or data[list_field] is None:
                data[list_field] = []

        return data

    async def extract_syllabus_info(self, syllabus_data: dict) -> dict:
        parser = JsonOutputParser(pydantic_object=SyllabusExtractResponse)
        
        input_json_str = json.dumps(syllabus_data, ensure_ascii=False, indent=2)

        template = """
        Bạn là API chuyển đổi và chuẩn hóa dữ liệu giáo dục.
        
        INPUT DATA (JSON):
        {input_json}
        
        NHIỆM VỤ:
        1. Phân tích dữ liệu Input trên.
        2. Nếu trường 'target' (Mục tiêu) bị rỗng, hãy tự sinh ra mục tiêu dựa trên trường 'description' (Mô tả).
        3. Chuẩn hóa lại các trường sang cấu trúc Output mong muốn (map các trường tương ứng).
        4. Giữ nguyên các thông tin đã có (như courseCode, credit...).
        
        OUTPUT FORMAT (JSON BẮT BUỘC):
        {{
            "courseCode": "...",
            "courseName": "...",
            "deptName": "...",
            "lecturerName": "...",
            "credit": 0,
            "academicYear": "...",
            "type": "...",
            "description": "...",
            "target": ["Mục tiêu 1", "Mục tiêu 2"], 
            "sessionPlans": [
                {{ "weekNo": 1, "topic": "...", "teachingMethod": "..." }}
            ],
            "assessments": [
                {{ "name": "...", "weightPercent": 0, "criteria": "..." }}
            ],
            "materials": [
                {{ "title": "...", "author": "...", "materialType": "TEXTBOOK" }}
            ],
            "courseRelations": [
                 {{ 
                    "relatedCourse": {{ "courseName": "...", "courseCode": "..." }},
                    "relationType": "..." 
                }}
            ]
        }}
        
        LƯU Ý: 
        - sessionPlans: Phải có "topic" và "teachingMethod".
        - Chỉ trả về JSON kết quả.
        """
        
        prompt = PromptTemplate(template=template, input_variables=["input_json"])
        chain = prompt | self.llm | parser
        
        try:
            print("AI đang xử lý JSON Input...")
            raw_result = await chain.ainvoke({"input_json": input_json_str})
            
            final_result = self.normalize_syllabus_data(raw_result, syllabus_data)
            return final_result
            
        except Exception as e:
            print(f"Lỗi extract: {e}")
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
        from langchain_core.prompts import PromptTemplate
        prompt = PromptTemplate(template=template, input_variables=["old_str", "new_str"])
        chain = prompt | self.llm 
        
        try:
            res_str = await chain.ainvoke({"old_str": old_str, "new_str": new_str})
            return json.loads(res_str)
        except Exception as e:
            return {"error": str(e), "message": "Lỗi khi so sánh JSON"}
                                                                                         

llm_service = LLMService()