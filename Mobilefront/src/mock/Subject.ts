export interface CLO {
    id: string;
    description: string;
}
export interface Subject {
    code: string;
    name: string;
    credits: number;
    major: string;
    semester: string;
    year: number;
    prerequisite: string | null;
    summary: string;
    published: boolean;
    clos: CLO[];
    ploMapping: Record<string, string[]>;
}

export const SUBJECTS: Subject[] = [
    {
        code: 'SE101',
        name: 'Software Engineering',
        major: 'CNTT',
        semester: 'HK1',
        year: 2025,
        credits: 3,
        prerequisite: 'None',
        published: true,
        summary:
            'Khóa học cung cấp kiến thức nền tảng về phát triển phần mềm, quy trình SE, UML và quản lý dự án.',
        clos: [
            { id: 'CLO1', description: 'Hiểu quy trình Software Engineering' },
            { id: 'CLO2', description: 'Áp dụng UML trong phân tích và thiết kế' },
        ],
        ploMapping: {
            CLO1: ['PLO1', 'PLO3'],
            CLO2: ['PLO2'],
        },
    },

    {
        code: 'CT101',
        name: 'Cấu trúc dữ liệu',
        major: 'CNTT',
        semester: 'HK1',
        year: 2024,
        credits: 4,
        prerequisite: 'Lập trình C',
        published: true,
        summary:
            'Trang bị kiến thức về cấu trúc dữ liệu cơ bản và nâng cao, giải quyết bài toán hiệu quả.',
        clos: [
            { id: 'CLO1', description: 'Hiểu các cấu trúc dữ liệu cơ bản' },
            { id: 'CLO2', description: 'Áp dụng cấu trúc dữ liệu vào bài toán thực tế' },
        ],
        ploMapping: {
            CLO1: ['PLO1'],
            CLO2: ['PLO3'],
        },
    },

    {

        code: 'IT203',
        name: 'Lập trình Web',
        major: 'CNTT',
        semester: 'HK2',
        year: 2024,
        credits: 3,
        prerequisite: 'CT101',
        published: true,
        summary:
            'Học cách xây dựng ứng dụng web với HTML, CSS, JavaScript và framework hiện đại.',
        clos: [
            { id: 'CLO1', description: 'Xây dựng giao diện web' },
            { id: 'CLO2', description: 'Phát triển web động với backend' },
        ],
        ploMapping: {
            CLO1: ['PLO2'],
            CLO2: ['PLO3'],
        },
    },

    {

        code: 'OOP236',
        name: 'Lập trình hướng đối tượng',
        major: 'CNTT',
        semester: 'HK1',
        year: 2023,
        credits: 3,
        prerequisite: 'CT101',
        published: true,
        summary:
            'Cung cấp kiến thức nền tảng về OOP, class, object, kế thừa, đa hình.',
        clos: [
            { id: 'CLO1', description: 'Hiểu nguyên lý OOP' },
            { id: 'CLO2', description: 'Áp dụng OOP trong lập trình Java' },
        ],
        ploMapping: {
            CLO1: ['PLO1'],
            CLO2: ['PLO2'],
        },
    },

    {

        code: 'MB401',
        name: 'Lập trình di động',
        major: 'CNTT',
        semester: 'HK1',
        year: 2025,
        credits: 3,
        prerequisite: 'OOP236',
        published: true,
        summary:
            'Phát triển ứng dụng di động với React Native, quản lý state và navigation.',
        clos: [
            { id: 'CLO1', description: 'Xây dựng UI di động' },
            { id: 'CLO2', description: 'Kết nối API và xử lý dữ liệu' },
        ],
        ploMapping: {
            CLO1: ['PLO2'],
            CLO2: ['PLO3'],
        },
    },

    {

        code: 'AI501',
        name: 'Trí tuệ nhân tạo',
        major: 'CNTT',
        semester: 'HK2',
        year: 2025,
        credits: 4,
        prerequisite: 'CT101',
        published: false,
        summary:
            'Giới thiệu các khái niệm AI, machine learning và ứng dụng thực tế.',
        clos: [
            { id: 'CLO1', description: 'Hiểu các khái niệm AI cơ bản' },
            { id: 'CLO2', description: 'Áp dụng thuật toán học máy đơn giản' },
        ],
        ploMapping: {
            CLO1: ['PLO1'],
            CLO2: ['PLO3'],
        },
    },
]

