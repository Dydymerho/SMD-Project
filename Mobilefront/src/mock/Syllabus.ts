export interface Syllabus {
    code: string;         // Mã môn học (liên kết với Subject)
    name?: string;
    title: string;        // Tên tài liệu
    department?: string;
    content: string;      // Nội dung tài liệu
    url?: string;         // Đường dẫn tài liệu
    description?: string; // Mô tả ngắn
    aiSummary?: string;   // AI Summary
    credits?: number;     // Số tín chỉ
    prerequisites?: string[]; // Môn học cần hoàn thành trước đó
    clos?: string[];      // Chuẩn đầu ra khóa học (CLOs)
    cloPloLinks?: CloPloMap[]; // Liên kết CLO → PLO
    subjectRelationship?: {
        type: 'tree' | 'text';
        value: string | string[];
    };
    teachingPlan?: TeachingPlan[];
    assessments?: AssessmentItem[];
    materials?: Material[];
}

export interface SubjectRelationship {
    prerequisites: string[]; // Môn học tiên quyết
    next: string[];          // Môn học tiếp theo   
    related?: string[];
}

export interface TeachingPlan {
    week: number;
    topic: string;
    method: string;
}

export interface AssessmentItem {
    type: string;      // Chuyên cần, giữa kỳ, cuối kỳ...
    weight: number;    // %
}

export interface Material {
    name: string;
    author: string;
    type: 'Chính' | 'Tham khảo';
}

export interface CloPloMap {
    clo: string;
    plos: string[];
}

export const SYLLABUS_CONTENT: Syllabus[] = [
    {
        code: 'SE101',
        name: 'Software Engineering',
        title: 'Đề cương môn Software Engineering',
        department: 'Khoa Công nghệ Thông tin',
        content: 'Tổng quan về phát triển phần mềm, quy trình SE, UML, quản lý dự án.',
        url: 'https://example.com/syllabus/SE101.pdf',
        description: 'Học phần nhập môn về phát triển phần mềm.',
        credits: 3,
        prerequisites: ['IT101'],
        aiSummary: 'Cung cấp kiến thức nền tảng về Software Engineering và quản lý dự án phần mềm.',
        clos: [
            'CLO1 – Hiểu quy trình Software Engineering',
            'CLO2 – Áp dụng UML trong phân tích & thiết kế',
            'CLO3 – Phân tích và lập kế hoạch dự án phần mềm'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO1', 'PLO3'] },
            { clo: 'CLO2', plos: ['PLO2', 'PLO4'] },
            { clo: 'CLO3', plos: ['PLO5', 'PLO6'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['SE101', 'SE201', 'SE301', 'PM401']
        },
        teachingPlan: [
            { week: 1, topic: 'Giới thiệu Software Engineering', method: 'Thuyết giảng' },
            { week: 2, topic: 'Process Models', method: 'Thảo luận' },
            { week: 3, topic: 'UML cơ bản', method: 'Thực hành' },
            { week: 4, topic: 'Requirement Engineering', method: 'Thảo luận nhóm' },
            { week: 5, topic: 'Software Design', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'Software Testing', method: 'Thực hành lab' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập cá nhân', weight: 20 },
            { type: 'Bài tập nhóm', weight: 20 },
            { type: 'Giữa kỳ', weight: 20 },
            { type: 'Cuối kỳ', weight: 30 }
        ],
        materials: [
            { name: 'Software Engineering', author: 'Ian Sommerville', type: 'Chính' },
            { name: 'Clean Code', author: 'Robert C. Martin', type: 'Tham khảo' },
            { name: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt', type: 'Tham khảo' }
        ]
    },
    {
        code: 'CT101',
        name: 'Cấu trúc dữ liệu',
        title: 'Đề cương môn Cấu trúc dữ liệu',
        department: 'Khoa Công nghệ Thông tin',
        content: 'Giới thiệu các cấu trúc dữ liệu cơ bản và nâng cao: Mảng, Danh sách liên kết, Stack, Queue, Cây, Đồ thị, Bảng băm.',
        url: 'https://example.com/syllabus/CT101.pdf',
        description: 'Học phần nền tảng về cấu trúc dữ liệu và giải thuật.',
        credits: 3,
        prerequisites: ['IT102', 'TH101'],
        aiSummary: 'Trang bị kiến thức và kỹ năng sử dụng cấu trúc dữ liệu hiệu quả trong lập trình.',
        clos: [
            'CLO1 – Hiểu và phân tích các cấu trúc dữ liệu cơ bản',
            'CLO2 – Áp dụng cấu trúc dữ liệu vào giải quyết bài toán thực tế',
            'CLO3 – Đánh giá độ phức tạp thuật toán'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO1', 'PLO2'] },
            { clo: 'CLO2', plos: ['PLO3', 'PLO4'] },
            { clo: 'CLO3', plos: ['PLO5'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['CT101', 'CT201', 'TH202', 'AI301']
        },
        teachingPlan: [
            { week: 1, topic: 'Giới thiệu Cấu trúc dữ liệu và Giải thuật', method: 'Thuyết giảng' },
            { week: 2, topic: 'Mảng & Danh sách', method: 'Thực hành' },
            { week: 3, topic: 'Stack & Queue', method: 'Thực hành' },
            { week: 4, topic: 'Cây nhị phân', method: 'Thuyết giảng + Thực hành' },
            { week: 5, topic: 'Cây tìm kiếm nhị phân', method: 'Thực hành lab' },
            { week: 6, topic: 'Đồ thị cơ bản', method: 'Thảo luận nhóm' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập thực hành', weight: 30 },
            { type: 'Kiểm tra giữa kỳ', weight: 25 },
            { type: 'Thi cuối kỳ', weight: 35 }
        ],
        materials: [
            { name: 'Data Structures and Algorithms', author: 'Michael T. Goodrich', type: 'Chính' },
            { name: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', type: 'Tham khảo' }
        ]
    },
    {
        code: 'IT203',
        name: 'Lập trình Web',
        title: 'Đề cương môn Lập trình Web',
        department: 'Khoa Công nghệ Thông tin',
        content: 'HTML5, CSS3, JavaScript ES6+, React.js, Node.js, Express.js, RESTful API, Database Integration.',
        url: 'https://example.com/syllabus/IT203.pdf',
        description: 'Xây dựng ứng dụng web hiện đại với công nghệ mới nhất.',
        credits: 3,
        prerequisites: ['CT101', 'OOP236'],
        aiSummary: 'Học phát triển full-stack web ứng dụng với frontend và backend.',
        clos: [
            'CLO1 – Xây dựng giao diện web responsive với HTML/CSS',
            'CLO2 – Phát triển ứng dụng web động với JavaScript và React',
            'CLO3 – Thiết kế và xây dựng RESTful API với Node.js'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO4', 'PLO6'] },
            { clo: 'CLO2', plos: ['PLO3', 'PLO7'] },
            { clo: 'CLO3', plos: ['PLO5', 'PLO8'] }
        ],
        subjectRelationship: {
            type: 'text',
            value: 'Liên quan đến Frontend Development, Backend Development, Full-stack Development'
        },
        teachingPlan: [
            { week: 1, topic: 'HTML5 & Semantic Web', method: 'Thực hành' },
            { week: 2, topic: 'CSS3 & Responsive Design', method: 'Thực hành' },
            { week: 3, topic: 'JavaScript ES6+ Fundamentals', method: 'Thuyết giảng + Thực hành' },
            { week: 4, topic: 'React.js Basics', method: 'Thực hành lab' },
            { week: 5, topic: 'Node.js & Express.js', method: 'Thảo luận nhóm' },
            { week: 6, topic: 'Database Integration & Deployment', method: 'Dự án nhóm' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập cá nhân', weight: 25 },
            { type: 'Dự án nhóm', weight: 25 },
            { type: 'Thi cuối kỳ', weight: 40 }
        ],
        materials: [
            { name: 'Full-Stack React Projects', author: 'Shama Hoque', type: 'Chính' },
            { name: 'Eloquent JavaScript', author: 'Marijn Haverbeke', type: 'Tham khảo' },
            { name: 'Node.js Design Patterns', author: 'Mario Casciaro', type: 'Tham khảo' }
        ]
    },
    {
        code: 'OOP236',
        name: 'Lập trình hướng đối tượng',
        title: 'Đề cương môn Lập trình hướng đối tượng',
        department: 'Khoa Công nghệ Thông tin',
        content: 'Class, Object, Inheritance, Polymorphism, Encapsulation, Abstraction, Design Patterns, UML Diagram.',
        url: 'https://example.com/syllabus/OOP236.pdf',
        description: 'Kiến thức nền tảng về lập trình hướng đối tượng với Java/C++.',
        credits: 3,
        prerequisites: ['TH101'],
        aiSummary: 'Trang bị tư duy lập trình hướng đối tượng và áp dụng design patterns.',
        clos: [
            'CLO1 – Hiểu và áp dụng 4 tính chất OOP',
            'CLO2 – Thiết kế hệ thống sử dụng UML',
            'CLO3 – Áp dụng Design Patterns phổ biến'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO2', 'PLO5'] },
            { clo: 'CLO2', plos: ['PLO3', 'PLO6'] },
            { clo: 'CLO3', plos: ['PLO4', 'PLO7'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['OOP236', 'IT203', 'MB401', 'PM301']
        },
        teachingPlan: [
            { week: 1, topic: 'Giới thiệu OOP & Class/Object', method: 'Thuyết giảng' },
            { week: 2, topic: 'Inheritance & Polymorphism', method: 'Thực hành' },
            { week: 3, topic: 'Encapsulation & Abstraction', method: 'Thảo luận' },
            { week: 4, topic: 'UML Class Diagram', method: 'Thực hành lab' },
            { week: 5, topic: 'Design Patterns cơ bản', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'Dự án OOP', method: 'Dự án nhóm' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập thực hành', weight: 30 },
            { type: 'Kiểm tra giữa kỳ', weight: 20 },
            { type: 'Dự án cuối kỳ', weight: 40 }
        ],
        materials: [
            { name: 'Head First Design Patterns', author: 'Eric Freeman, Elisabeth Robson', type: 'Chính' },
            { name: 'Clean Code', author: 'Robert C. Martin', type: 'Tham khảo' },
            { name: 'UML Distilled', author: 'Martin Fowler', type: 'Tham khảo' }
        ]
    },
    {
        code: 'MB401',
        name: 'Lập trình di động',
        title: 'Đề cương môn Lập trình di động',
        department: 'Khoa Công nghệ Thông tin',
        content: 'React Native, Navigation, State Management, Native Modules, API Integration, Firebase, App Deployment.',
        url: 'https://example.com/syllabus/MB401.pdf',
        description: 'Phát triển ứng dụng di động đa nền tảng.',
        credits: 3,
        prerequisites: ['OOP236', 'IT203'],
        aiSummary: 'Xây dựng ứng dụng di động đa nền tảng với React Native và tích hợp dịch vụ đám mây.',
        clos: [
            'CLO1 – Thiết kế giao diện mobile với React Native',
            'CLO2 – Quản lý state và navigation trong ứng dụng di động',
            'CLO3 – Tích hợp API và dịch vụ đám mây (Firebase)'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO6', 'PLO8'] },
            { clo: 'CLO2', plos: ['PLO4', 'PLO7'] },
            { clo: 'CLO3', plos: ['PLO5', 'PLO9'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['MB401', 'MB501', 'PM401', 'AI401']
        },
        teachingPlan: [
            { week: 1, topic: 'Giới thiệu React Native & Setup', method: 'Thực hành' },
            { week: 2, topic: 'Component & Styling', method: 'Thực hành' },
            { week: 3, topic: 'Navigation & Routing', method: 'Thuyết giảng + Thực hành' },
            { week: 4, topic: 'State Management với Redux', method: 'Thực hành lab' },
            { week: 5, topic: 'API Integration & Authentication', method: 'Thảo luận nhóm' },
            { week: 6, topic: 'Firebase Integration & App Deployment', method: 'Dự án nhóm' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập thực hành', weight: 30 },
            { type: 'Dự án ứng dụng di động', weight: 30 },
            { type: 'Thi cuối kỳ', weight: 30 }
        ],
        materials: [
            { name: 'React Native in Action', author: 'Nader Dabit', type: 'Chính' },
            { name: 'Fullstack React Native', author: 'Houssein Djirdeh, Anthony Accomazzo', type: 'Tham khảo' },
            { name: 'Firebase Essentials', author: 'Google Developers', type: 'Tham khảo' }
        ]
    },
    {
        code: 'AI501',
        name: 'Trí tuệ nhân tạo',
        title: 'Đề cương môn Trí tuệ nhân tạo',
        department: 'Khoa Công nghệ Thông tin',
        content: 'Introduction to AI, Machine Learning Algorithms, Neural Networks, Natural Language Processing, Computer Vision, AI Ethics.',
        url: 'https://example.com/syllabus/AI501.pdf',
        description: 'Nhập môn Trí tuệ nhân tạo và Học máy.',
        credits: 3,
        prerequisites: ['CT101', 'TH202', 'XM302'],
        aiSummary: 'Kiến thức nền tảng về AI, Machine Learning và ứng dụng thực tế.',
        clos: [
            'CLO1 – Hiểu các khái niệm cơ bản về AI và ML',
            'CLO2 – Áp dụng các thuật toán Machine Learning cơ bản',
            'CLO3 – Xây dựng mô hình Neural Network đơn giản'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO7', 'PLO9'] },
            { clo: 'CLO2', plos: ['PLO8', 'PLO10'] },
            { clo: 'CLO3', plos: ['PLO9', 'PLO11'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['AI501', 'ML601', 'DL701', 'NLP801']
        },
        teachingPlan: [
            { week: 1, topic: 'Giới thiệu AI & Lịch sử phát triển', method: 'Thuyết giảng' },
            { week: 2, topic: 'Machine Learning cơ bản', method: 'Thảo luận' },
            { week: 3, topic: 'Supervised Learning Algorithms', method: 'Thực hành' },
            { week: 4, topic: 'Neural Networks cơ bản', method: 'Thực hành lab' },
            { week: 5, topic: 'Natural Language Processing giới thiệu', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'AI Ethics & Tương lai AI', method: 'Thảo luận nhóm' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập thực hành Python', weight: 25 },
            { type: 'Dự án nhóm AI', weight: 25 },
            { type: 'Thi cuối kỳ', weight: 40 }
        ],
        materials: [
            { name: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', type: 'Chính' },
            { name: 'Hands-On Machine Learning', author: 'Aurélien Géron', type: 'Tham khảo' },
            { name: 'Deep Learning', author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville', type: 'Tham khảo' }
        ]
    }
];

// Utility functions for working with syllabus data
export function getSyllabusByCode(code: string): Syllabus | undefined {
    return SYLLABUS_CONTENT.find(syllabus => syllabus.code === code);
}

export function getPrerequisitesChain(code: string): string[] {
    const syllabus = getSyllabusByCode(code);
    if (!syllabus || !syllabus.prerequisites) return [];

    const chain: string[] = [];
    const visited = new Set<string>();

    function traverse(currentCode: string) {
        if (visited.has(currentCode)) return;
        visited.add(currentCode);

        const current = getSyllabusByCode(currentCode);
        if (current && current.prerequisites) {
            current.prerequisites.forEach(prereq => {
                traverse(prereq);
                if (!chain.includes(prereq)) {
                    chain.push(prereq);
                }
            });
        }
    }

    traverse(code);
    return chain;
}

export function getRelatedSubjects(code: string): string[] {
    const syllabus = getSyllabusByCode(code);
    if (!syllabus || !syllabus.subjectRelationship) return [];

    if (syllabus.subjectRelationship.type === 'tree' && Array.isArray(syllabus.subjectRelationship.value)) {
        return syllabus.subjectRelationship.value;
    }

    return [];
}

export function getSyllabusByDepartment(department: string): Syllabus[] {
    return SYLLABUS_CONTENT.filter(syllabus =>
        syllabus.department?.toLowerCase().includes(department.toLowerCase())
    );
}

export function calculateTotalCredits(codes: string[]): number {
    return codes.reduce((total, code) => {
        const syllabus = getSyllabusByCode(code);
        return total + (syllabus?.credits || 0);
    }, 0);
}