from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

class CompareSyllabusJsonRequest(BaseModel):
    old_syllabus: Dict[str, Any]
    new_syllabus: Dict[str, Any]

class SummaryRequest(BaseModel):
    syllabus: Dict[str, Any] = Field(description="Dữ liệu JSON của môn học cần tóm tắt")

class SummaryResponse(BaseModel):
    summary: str

class CloPloCheckRequest(BaseModel):
    clo_text: str
    plo_text: str

class CloPloCheckResponse(BaseModel):
    score: int = 0
    reasoning: str = ""
    is_aligned: bool = False

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
    weekNo: int = Field(default=0, description="Tuần thứ mấy")
    topic: str = Field(default="", description="Chủ đề bài học")
    teachingMethod: str = Field(default="", description="Phương pháp giảng dạy")

class AssessmentItem(BaseModel):
    name: str = Field(default="", description="Tên bài kiểm tra")
    weightPercent: int = Field(default=0, description="Trọng số phần trăm")
    criteria: str = Field(default="", description="Hình thức thi")

class MaterialItem(BaseModel):
    title: str = Field(default="", description="Tên sách hoặc tài liệu")
    author: str = Field(default="", description="Tên tác giả")
    materialType: str = Field(default="", description="Loại tài liệu")

class RelatedCourseInfo(BaseModel):
    courseCode: str = Field(default="", description="Mã môn học liên quan")
    courseName: str = Field(default="", description="Tên môn học liên quan")
    credits: int = Field(default=0, description="Số tín chỉ")
    department: dict = Field(default={}, description="Khoa phụ trách")
    courseType: str = Field(default="", description="Loại môn")

class CourseRelationItem(BaseModel):
    relatedCourse: RelatedCourseInfo = Field(default_factory=RelatedCourseInfo)
    relationType: str = Field(default="", description="Loại quan hệ")

class SyllabusExtractResponse(BaseModel):
    courseCode: str = Field(default="", description="Mã môn học")
    courseName: str = Field(default="", description="Tên môn học")
    deptName: str = Field(default="", description="Khoa hoặc Bộ môn phụ trách")
    lecturerName: str = Field(default="", description="Tên giảng viên")
    credit: int = Field(default=0, description="Số tín chỉ")
    academicYear: str = Field(default="", description="Năm học")
    type: str = Field(default="", description="Loại môn")
    description: str = Field(default="", description="Mô tả tóm tắt môn học")
    target: List[str] = Field(default=[], description="Danh sách mục tiêu môn học")
    sessionPlans: List[SessionPlanItem] = Field(default=[])
    assessments: List[AssessmentItem] = Field(default=[])
    materials: List[MaterialItem] = Field(default=[])
    courseRelations: List[CourseRelationItem] = Field(default=[])