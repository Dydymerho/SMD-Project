export type CourseNode = {
    courseId: number;
    courseCode: string;
    courseName: string;
    credits: number;
    courseType: string;
    level?: number;
    // Các mảng con có thể chứa chính CourseNode (đệ quy) hoặc null
    prerequisites: CourseNode[] | null;
    corequisites: CourseNode[] | null;
    equivalents: CourseNode[] | null;
}