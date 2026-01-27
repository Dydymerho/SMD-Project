import {
    syllabusDetailApi,
    SessionPlanApi,
    AssessmentApi,
    MaterialApi
} from '../api'; // File indexAPI
import { SubjectDetailData } from '../../backend/types/SubjectDetail';

// Helper: Chuyển đổi response về mảng an toàn
const getListData = (response: any) => {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.data)) return response.data;
    return [];
};


const filterBySyllabus = (list: any[], syllabusId: any) => {
    if (!syllabusId) return [];

    return list.filter(item => {
        return (
            item.syllabusId === syllabusId ||  // Trường hợp chuẩn camelCase
            item.syllabus_id === syllabusId || // Trường hợp snake_case (thường gặp)
            item.SyllabusId === syllabusId ||  // Trường hợp PascalCase
            item.id === syllabusId             // Trường hợp item chính là con (hiếm)
        );
    });
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

            // 2. Lấy danh sách thô
            const listSyllabus = getListData(sysRes);
            const listPlans = getListData(planRes);
            const listAssess = getListData(assessRes);
            const listMaterials = getListData(matRes);

            // 3. Tìm môn học hiện tại theo Code
            const currentSyllabus = listSyllabus.find((s: any) =>
                s.courseCode?.trim().toLowerCase() === courseCode?.trim().toLowerCase()
            );

            if (!currentSyllabus) {
                console.log(`❌ Không tìm thấy môn học: ${courseCode}`);
                return null;
            }

            // 4. Lấy ID của môn học để lọc
            // Lưu ý: Kiểm tra xem ID môn học tên là 'id', 'syllabusId' hay 'courseId'
            const currentId = currentSyllabus.id || currentSyllabus.syllabusId;

            console.log(`✅ Tìm thấy môn học: ${courseCode}, ID: ${currentId}`);

            if (!currentId) {
                console.warn("⚠️ Cảnh báo: Dữ liệu môn học không có trường 'id'. Không thể lọc dữ liệu con.");
                // Trả về dữ liệu thô (không lọc) hoặc rỗng tùy bạn quyết định
                return {
                    info: currentSyllabus,
                    plans: [],
                    assessments: [],
                    materials: []
                };
            }

            // 5. Áp dụng Lọc thông minh cho các danh sách con
            const relatedPlans = filterBySyllabus(listPlans, currentId);
            const relatedAssessments = filterBySyllabus(listAssess, currentId);
            const relatedMaterials = filterBySyllabus(listMaterials, currentId);

            console.log(`📊 Kết quả lọc cho ID ${currentId}:`);
            console.log(`- Plans: ${relatedPlans.length}/${listPlans.length}`);
            console.log(`- Assessments: ${relatedAssessments.length}/${listAssess.length}`);
            console.log(`- Materials: ${relatedMaterials.length}/${listMaterials.length}`);

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