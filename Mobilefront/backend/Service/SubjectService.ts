import {
    syllabusDetailApi,
    SessionPlanApi,
    AssessmentApi,
    MaterialApi
} from '../api'; // Gọi từ file indexAPI
import { SubjectDetailData } from '../../backend/types/SubjectDetail';

// Helper function: Tự động lấy mảng dữ liệu dù Backend trả về dạng nào
const getListData = (response: any) => {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.data)) return response.data;
    return [];
};

export const SubjectService = {
    getFullDetail: async (courseCode: string): Promise<SubjectDetailData | null> => {
        try {
            // 1. Gọi song song tất cả API
            const [sysRes, planRes, assessRes, matRes] = await Promise.all([
                syllabusDetailApi.getSyllabusDetail(),
                SessionPlanApi.getSessionPlan(),
                AssessmentApi.getAssessment(),
                MaterialApi.getMaterial()
            ]);

            // 2. Chuẩn hóa dữ liệu về dạng mảng
            const listSyllabus = getListData(sysRes);
            const listPlans = getListData(planRes);
            const listAssess = getListData(assessRes);
            const listMaterials = getListData(matRes);

            // 3. Tìm môn học hiện tại
            // Lưu ý: So sánh linh hoạt (có thể cần trim() khoảng trắng thừa)
            const currentSyllabus = listSyllabus.find((s: any) =>
                s.courseCode?.trim() === courseCode?.trim()
            );

            if (!currentSyllabus) {
                return null;
            }

            // 4. Lấy ID để lọc dữ liệu con
            const syllabusId = currentSyllabus.id;

            // 5. SỬA TẠM THỜI: Lấy tất cả dữ liệu (Không lọc) để kiểm tra UI
            // Khi nào backend có syllabusId chuẩn thì uncomment dòng filter sau

            // const relatedPlans = listPlans.filter((item: any) => item.syllabusId === syllabusId);
            const relatedPlans = listPlans; // <--- Lấy hết để test hiển thị

            // const relatedAssessments = listAssess.filter((item: any) => item.syllabusId === syllabusId);
            const relatedAssessments = listAssess; // <--- Lấy hết

            // const relatedMaterials = listMaterials.filter((item: any) => item.syllabusId === syllabusId);
            const relatedMaterials = listMaterials; // <--- Lấy hết

            // DEBUG LOG: In ra để xem dữ liệu thực tế có trường gì
            if (listPlans.length > 0) {
                console.log("Cấu trúc 1 SessionPlan:", JSON.stringify(listPlans[0], null, 2));
            }

            return {
                info: currentSyllabus,
                plans: relatedPlans,
                assessments: relatedAssessments,
                materials: relatedMaterials
            };

        } catch (error) {
            console.error("SubjectService Error:", error);
            throw error;
        }
    }
};