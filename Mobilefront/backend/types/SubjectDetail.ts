// types/SubjectDetails.ts
import { syllabus } from './syllabusDetail'; // File bạn vừa cung cấp
import { SessionPlan } from './SessionPlan';
import { Assessment } from './Assessment';
import { Material } from './Material'; // Hoặc MaterialApi nếu bạn chưa sửa tên file

export interface SubjectDetailData {
    info: syllabus;               // Thông tin môn học (có id, target, clos)
    plans: SessionPlan[];         // Kế hoạch
    assessments: Assessment[];    // Đánh giá
    materials: Material[];        // Tài liệu
}