export type syllabus = {
    id: number; // Bắt buộc phải có để link với Materials/SessionPlan
    syllabusId?: number;
    courseCode: string;
    courseName: string;
    lecturerName: string;
    deptName: string;
    type?: string;
    credit: number;
    academicYear: string;
    aiSumary: string;
    target?: string[];
    clos?: string[];
}