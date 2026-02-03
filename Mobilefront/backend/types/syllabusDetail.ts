export type syllabus = {
    id: number;
    syllabusId?: number;
    courseCode: string;
    courseName: string;
    lecturerName: string;
    deptName: string;
    description?: string;
    type?: string;
    credit: number;
    academicYear: string;
    aiSumary: string;
    target?: string[];
    clos?: string[];
}