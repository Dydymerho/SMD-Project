import os
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.schemas.ai_schema import CloPloCheckResponse

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3"

class LLMService:
    def __init__(self):
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        
        print(f"Đang kết nối AI tại: {base_url}") 

        self.llm = OllamaLLM(
            base_url=base_url,
            model="llama3", 
            temperature=0.2
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
        Bạn là trợ lý ảo người Việt Nam.
        Nhiệm vụ: So sánh hai văn bản.
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

llm_service = LLMService()