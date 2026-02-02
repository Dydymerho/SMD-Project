// types/SubjectDetails.ts
import { syllabus } from './syllabusDetail';
import { SessionPlan } from './SessionPlan';
import { Assessment } from './Assessment';
import { Material } from './Material';

export interface SubjectDetailData {
    info: syllabus;               // Thông tin môn học (có id, target, clos)
    plans: SessionPlan[];         // Kế hoạch
    assessments: Assessment[];    // Đánh giá
    materials: Material[];        // Tài liệu
}