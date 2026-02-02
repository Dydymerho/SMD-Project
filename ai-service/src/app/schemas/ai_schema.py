from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
class CompareSyllabusJsonRequest(BaseModel):
    old_syllabus: Dict[str, Any]
    new_syllabus: Dict[str, Any]
class ExtractSyllabusRequest(BaseModel):
    syllabus_data: Dict[str, Any] 

class SummaryRequest(BaseModel):
    text: str

class SummaryResponse(BaseModel):
    summary: str

class CloPloCheckRequest(BaseModel):
    clo_text: str
    plo_text: str

class CloPloCheckResponse(BaseModel):
    score: int
    reasoning: str
    is_aligned: bool

class DiffRequest(BaseModel):
    old_content: str
    new_content: str

class HighlightItem(BaseModel):
    type: str 
    content: str

class DiffResponse(BaseModel):
    similarity_percent: float
    ai_analysis: str
    highlight_data: List[HighlightItem]

class SessionPlanItem(BaseModel):
    weekNo: int = Field(description="Tuần thứ mấy")
    topic: str = Field(description="Chủ đề bài học")
    teachingMethod: str = Field(description="Phương pháp giảng dạy")

class AssessmentItem(BaseModel):
    name: str = Field(description="Tên bài kiểm tra")
    weightPercent: int = Field(description="Trọng số phần trăm")
    criteria: str = Field(description="Hình thức thi")

class MaterialItem(BaseModel):
    title: str = Field(description="Tên sách hoặc tài liệu")
    author: str = Field(description="Tên tác giả")
    materialType: str = Field(description="Loại tài liệu")

class RelatedCourseInfo(BaseModel):
    courseCode: str = Field(default="", description="Mã môn học liên quan")
    courseName: str = Field(default="", description="Tên môn học liên quan")
    credits: int = Field(default=0, description="Số tín chỉ")
    department: dict = Field(default={}, description="Khoa phụ trách")
    courseType: str = Field(default="", description="Loại môn")

class CourseRelationItem(BaseModel):
    relatedCourse: RelatedCourseInfo
    relationType: str = Field(description="Loại quan hệ")

class SyllabusExtractResponse(BaseModel):
    courseCode: str = Field(description="Mã môn học")
    courseName: str = Field(description="Tên môn học")
    deptName: str = Field(description="Khoa hoặc Bộ môn phụ trách")
    lecturerName: str = Field(description="Tên giảng viên")
    credit: int = Field(description="Số tín chỉ")
    academicYear: str = Field(description="Năm học")
    type: str = Field(description="Loại môn")
    description: str = Field(description="Mô tả tóm tắt môn học")
    target: List[str] = Field(description="Danh sách mục tiêu môn học")
    sessionPlans: List[SessionPlanItem] = Field(default=[])
    assessments: List[AssessmentItem] = Field(default=[])
    materials: List[MaterialItem] = Field(default=[])
    courseRelations: List[CourseRelationItem] = Field(default=[])