export interface Syllabus {
    code: string;         // Mã môn học (liên kết với Subject)
    name?: string;
    author?: string;
    title: string;        // Tên tài liệu
    department?: string;
    type?: string;       // Loại học phần (Bắt buộc/Tự chọn)
    version?: string;    // Phiên bản tài liệu
    datePublished?: string; // Ngày xuất bản tài liệu
    semester: number;     // Học kỳ (1-8) - THÊM VÀO ĐÂY
    academicYear?: string; // Năm học (ví dụ: "2024–2025")
    content: string;      // Nội dung tài liệu
    url?: string;         // Đường dẫn tài liệu
    description?: string; // Mô tả ngắn
    aiSummary?: string;   // AI Summary
    credits?: number;     // Số tín chỉ
    prerequisites?: string[]; // Môn học cần hoàn thành trước đó
    studentmission?: string[]; // Nhiệm vụ học tập của sinh viên 
    clos?: string[];      // Chuẩn đầu ra khóa học (CLOs)
    target?: string[];    // Mục tiêu học phần
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
        code: 'IT101',
        name: 'Nhập môn lập trình',
        author: 'TS. Trần Văn Hải',
        title: 'Đề cương môn Nhập môn lập trình',
        department: 'Khoa Công nghệ Thông tin',
        type: 'Bắt buộc',
        version: '2.0',
        datePublished: '2024-08-15',
        semester: 1,
        academicYear: '2024-2025',
        content: 'Giới thiệu ngôn ngữ lập trình C, cấu trúc cơ bản, biến, kiểu dữ liệu, cấu trúc điều khiển, hàm, mảng.',
        url: 'https://example.com/syllabus/IT101.pdf',
        description: 'Môn học nền tảng cho sinh viên bắt đầu học lập trình.',
        aiSummary: 'Cung cấp kiến thức cơ bản về lập trình với ngôn ngữ C, xây dựng tư duy lập trình.',
        credits: 3,
        prerequisites: [],
        studentmission: [
            '- Sinh viên phải tham dự tối thiểu 80% số tiết của học phần',
            '- Làm và nộp các bài tập / báo cáo / làm việc nhóm / thuyết trình....đúng thời gian quy định',
            '- Tự nghiên cứu các vấn đề được giao ở nhà hoặc thư viện',
            '- Hoàn thành các bài đánh giá quá trình; kết thúc học phần.'],
        target: [
            'Xây dựng nền tảng tư duy lập trình cơ bản',
            'Nắm vững cú pháp và cấu trúc ngôn ngữ C',
            'Phát triển kỹ năng giải quyết vấn đề thông qua lập trình',
            'Chuẩn bị cho các môn học lập trình nâng cao'
        ],
        clos: [
            'Hiểu và áp dụng cú pháp cơ bản của ngôn ngữ C',
            'Viết chương trình với các cấu trúc điều khiển cơ bản',
            'Sử dụng hàm và mảng trong giải quyết bài toán'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO1', 'PLO2'] },
            { clo: 'CLO2', plos: ['PLO3', 'PLO4'] },
            { clo: 'CLO3', plos: ['PLO5', 'PLO6'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['IT101', 'OOP236', 'CT101', 'IT203']
        },
        teachingPlan: [
            { week: 1, topic: 'Giới thiệu lập trình và môi trường', method: 'Thuyết giảng' },
            { week: 2, topic: 'Biến, kiểu dữ liệu và toán tử', method: 'Thực hành' },
            { week: 3, topic: 'Cấu trúc điều khiển if-else', method: 'Thực hành' },
            { week: 4, topic: 'Vòng lặp (for, while, do-while)', method: 'Thực hành lab' },
            { week: 5, topic: 'Hàm và tham số', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'Mảng một chiều', method: 'Thực hành' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập cá nhân', weight: 30 },
            { type: 'Kiểm tra giữa kỳ', weight: 20 },
            { type: 'Thi cuối kỳ', weight: 40 }
        ],
        materials: [
            { name: 'Programming in C', author: 'Stephen G. Kochan', type: 'Chính' },
            { name: 'The C Programming Language', author: 'Brian W. Kernighan, Dennis M. Ritchie', type: 'Tham khảo' }
        ]
    },
    {
        code: 'TH101',
        name: 'Toán cao cấp 1',
        author: 'PGS.TS. Nguyễn Thị Lan',
        title: 'Đề cương môn Toán cao cấp 1',
        department: 'Khoa Khoa học Cơ bản',
        type: 'Bắt buộc',
        version: '1.5',
        datePublished: '2024-08-10',
        semester: 1,
        academicYear: '2024-2025',
        content: 'Đại số tuyến tính: ma trận, định thức, hệ phương trình tuyến tính, không gian vector.',
        url: 'https://example.com/syllabus/TH101.pdf',
        description: 'Cung cấp kiến thức toán học nền tảng cho kỹ thuật.',
        aiSummary: 'Xây dựng nền tảng toán học về đại số tuyến tính và ma trận.',
        credits: 3,
        prerequisites: [],
        studentmission: [
            '- Sinh viên phải tham dự tối thiểu 80% số tiết của học phần',
            '- Làm và nộp các bài tập / báo cáo / làm việc nhóm / thuyết trình....đúng thời gian quy định',
            '- Tự nghiên cứu các vấn đề được giao ở nhà hoặc thư viện',
            '- Hoàn thành các bài đánh giá quá trình; kết thúc học phần.'],
        target: [
            'Cung cấp công cụ toán học cơ bản cho các môn kỹ thuật',
            'Phát triển tư duy logic và khả năng phân tích',
            'Rèn luyện kỹ năng giải quyết bài toán đại số tuyến tính',
            'Chuẩn bị nền tảng cho môn Xác suất thống kê'
        ],
        clos: [
            'Tính toán với ma trận và định thức',
            'Giải hệ phương trình tuyến tính',
            'Hiểu khái niệm không gian vector'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO1', 'PLO7'] },
            { clo: 'CLO2', plos: ['PLO2', 'PLO8'] },
            { clo: 'CLO3', plos: ['PLO3', 'PLO9'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['TH101', 'TH202', 'XM302', 'AI501']
        },
        teachingPlan: [
            { week: 1, topic: 'Ma trận và phép toán', method: 'Thuyết giảng' },
            { week: 2, topic: 'Định thức và tính chất', method: 'Thực hành' },
            { week: 3, topic: 'Hệ phương trình tuyến tính', method: 'Thảo luận' },
            { week: 4, topic: 'Giải hệ bằng phương pháp Gauss', method: 'Thực hành lab' },
            { week: 5, topic: 'Không gian vector', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'Cơ sở và số chiều', method: 'Thực hành' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập về nhà', weight: 20 },
            { type: 'Kiểm tra giữa kỳ', weight: 30 },
            { type: 'Thi cuối kỳ', weight: 40 }
        ],
        materials: [
            { name: 'Linear Algebra and Its Applications', author: 'David C. Lay', type: 'Chính' },
            { name: 'Advanced Engineering Mathematics', author: 'Erwin Kreyszig', type: 'Tham khảo' }
        ]
    },
    {
        code: 'IT102',
        name: 'Cấu trúc máy tính',
        author: 'TS. Lê Minh Đức',
        title: 'Đề cương môn Cấu trúc máy tính',
        department: 'Khoa Kỹ thuật Máy tính',
        type: 'Bắt buộc',
        version: '2.1',
        datePublished: '2024-08-20',
        semester: 2,
        academicYear: '2024-2025',
        content: 'Kiến trúc máy tính, bộ xử lý, bộ nhớ, hệ thống vào ra, assembly cơ bản.',
        url: 'https://example.com/syllabus/IT102.pdf',
        description: 'Hiểu biết về cấu trúc và hoạt động của máy tính.',
        aiSummary: 'Cung cấp kiến thức về kiến trúc phần cứng máy tính và lập trình assembly.',
        credits: 3,
        prerequisites: ['IT101'],
        studentmission: [
            '- Sinh viên phải tham dự tối thiểu 80% số tiết của học phần',
            '- Làm và nộp các bài tập / báo cáo / làm việc nhóm / thuyết trình....đúng thời gian quy định',
            '- Tự nghiên cứu các vấn đề được giao ở nhà hoặc thư viện',
            '- Hoàn thành các bài đánh giá quá trình; kết thúc học phần.'],
        target: [
            'Hiểu rõ kiến trúc và hoạt động cơ bản của máy tính',
            'Nắm vững nguyên lý làm việc của CPU, bộ nhớ và hệ thống I/O',
            'Phát triển kỹ năng lập trình assembly cơ bản',
            'Chuẩn bị cho các môn học về hệ điều hành và mạng máy tính'
        ],
        clos: [
            'Hiểu kiến trúc cơ bản của máy tính',
            'Phân tích hoạt động của CPU và bộ nhớ',
            'Viết chương trình assembly đơn giản'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO4', 'PLO8'] },
            { clo: 'CLO2', plos: ['PLO5', 'PLO9'] },
            { clo: 'CLO3', plos: ['PLO6', 'PLO10'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['IT102', 'HT301', 'MM401', 'AT501']
        },
        teachingPlan: [
            { week: 1, topic: 'Tổng quan kiến trúc máy tính', method: 'Thuyết giảng' },
            { week: 2, topic: 'Biểu diễn dữ liệu và số học', method: 'Thực hành' },
            { week: 3, topic: 'Bộ xử lý trung tâm (CPU)', method: 'Thảo luận' },
            { week: 4, topic: 'Hệ thống bộ nhớ', method: 'Thực hành lab' },
            { week: 5, topic: 'Hệ thống vào ra (I/O)', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'Lập trình Assembly cơ bản', method: 'Thực hành' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập thực hành', weight: 25 },
            { type: 'Dự án nhóm', weight: 25 },
            { type: 'Thi cuối kỳ', weight: 40 }
        ],
        materials: [
            { name: 'Computer Organization and Design', author: 'David A. Patterson, John L. Hennessy', type: 'Chính' },
            { name: 'Structured Computer Organization', author: 'Andrew S. Tanenbaum', type: 'Tham khảo' }
        ]
    },
    {
        code: 'EN202',
        name: 'Tiếng Anh chuyên ngành CNTT',
        author: 'ThS. Phan Thị Hương',
        title: 'Đề cương môn Tiếng Anh chuyên ngành CNTT',
        department: 'Khoa Ngoại ngữ',
        type: 'Bắt buộc',
        version: '1.2',
        datePublished: '2024-08-25',
        semester: 3,
        academicYear: '2024-2025',
        content: 'Từ vựng chuyên ngành CNTT, đọc hiểu tài liệu kỹ thuật, viết email chuyên nghiệp, thuyết trình kỹ thuật.',
        url: 'https://example.com/syllabus/EN202.pdf',
        description: 'Nâng cao kỹ năng tiếng Anh trong lĩnh vực công nghệ thông tin.',
        aiSummary: 'Phát triển kỹ năng tiếng Anh chuyên ngành CNTT cho môi trường làm việc quốc tế.',
        credits: 2,
        prerequisites: ['EN101'],
        studentmission: [
            '- Sinh viên phải tham dự tối thiểu 80% số tiết của học phần',
            '- Làm và nộp các bài tập / báo cáo / làm việc nhóm / thuyết trình....đúng thời gian quy định',
            '- Tự nghiên cứu các vấn đề được giao ở nhà hoặc thư viện',
            '- Hoàn thành các bài đánh giá quá trình; kết thúc học phần.'],
        target: [
            'Xây dựng vốn từ vựng chuyên ngành CNTT',
            'Nâng cao kỹ năng đọc hiểu tài liệu kỹ thuật tiếng Anh',
            'Phát triển kỹ năng viết email và báo cáo chuyên nghiệp',
            'Rèn luyện kỹ năng thuyết trình kỹ thuật bằng tiếng Anh'
        ],
        clos: [
            'Hiểu và sử dụng từ vựng chuyên ngành CNTT',
            'Đọc và dịch tài liệu kỹ thuật tiếng Anh',
            'Viết email và báo cáo chuyên nghiệp'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO11', 'PLO12'] },
            { clo: 'CLO2', plos: ['PLO12', 'PLO13'] },
            { clo: 'CLO3', plos: ['PLO13', 'PLO14'] }
        ],
        subjectRelationship: {
            type: 'text',
            value: 'Hỗ trợ cho tất cả các môn học yêu cầu đọc tài liệu tiếng Anh'
        },
        teachingPlan: [
            { week: 1, topic: 'Từ vựng cơ bản về phần cứng', method: 'Thuyết giảng' },
            { week: 2, topic: 'Từ vựng về phần mềm và lập trình', method: 'Thực hành' },
            { week: 3, topic: 'Đọc hiểu tài liệu kỹ thuật', method: 'Thảo luận' },
            { week: 4, topic: 'Viết email chuyên nghiệp', method: 'Thực hành lab' },
            { week: 5, topic: 'Kỹ năng thuyết trình kỹ thuật', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'Ôn tập và kiểm tra', method: 'Thực hành' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 15 },
            { type: 'Bài tập từ vựng', weight: 25 },
            { type: 'Bài thuyết trình nhóm', weight: 30 },
            { type: 'Thi cuối kỳ', weight: 30 }
        ],
        materials: [
            { name: 'English for Information Technology', author: 'Maja Olejniczak', type: 'Chính' },
            { name: 'Oxford English for Computing', author: 'Keith Boeckner, P. Charles Brown', type: 'Tham khảo' }
        ]
    },
    {
        code: 'TH202',
        name: 'Xác suất thống kê',
        author: 'TS. Vũ Đình Hoàng',
        title: 'Đề cương môn Xác suất thống kê',
        department: 'Khoa Khoa học Cơ bản',
        type: 'Bắt buộc',
        version: '1.8',
        datePublished: '2024-01-15',
        semester: 4,
        academicYear: '2024-2025',
        content: 'Xác suất, biến ngẫu nhiên, phân phối xác suất, thống kê mô tả, ước lượng, kiểm định giả thuyết.',
        url: 'https://example.com/syllabus/TH202.pdf',
        description: 'Cung cấp kiến thức xác suất thống kê ứng dụng trong phân tích dữ liệu.',
        aiSummary: 'Nền tảng toán học cho machine learning và phân tích dữ liệu.',
        credits: 3,
        prerequisites: ['TH101'],
        studentmission: [
            '- Sinh viên phải tham dự tối thiểu 80% số tiết của học phần',
            '- Làm và nộp các bài tập / báo cáo / làm việc nhóm / thuyết trình....đúng thời gian quy định',
            '- Tự nghiên cứu các vấn đề được giao ở nhà hoặc thư viện',
            '- Hoàn thành các bài đánh giá quá trình; kết thúc học phần.'],
        target: [
            'Cung cấp nền tảng toán học cho các thuật toán Machine Learning',
            'Phát triển kỹ năng phân tích và xử lý dữ liệu thống kê',
            'Nắm vững các phương pháp ước lượng và kiểm định giả thuyết',
            'Ứng dụng xác suất thống kê trong giải quyết bài toán thực tế'
        ],
        clos: [
            'Tính toán xác suất cơ bản',
            'Hiểu và áp dụng các phân phối xác suất',
            'Thực hiện phân tích thống kê cơ bản'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO7', 'PLO9'] },
            { clo: 'CLO2', plos: ['PLO8', 'PLO10'] },
            { clo: 'CLO3', plos: ['PLO9', 'PLO11'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['TH202', 'XM302', 'AI501', 'TK601']
        },
        teachingPlan: [
            { week: 1, topic: 'Khái niệm xác suất cơ bản', method: 'Thuyết giảng' },
            { week: 2, topic: 'Biến ngẫu nhiên', method: 'Thực hành' },
            { week: 3, topic: 'Phân phối xác suất rời rạc', method: 'Thảo luận' },
            { week: 4, topic: 'Phân phối xác suất liên tục', method: 'Thực hành lab' },
            { week: 5, topic: 'Thống kê mô tả', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'Ước lượng tham số', method: 'Thực hành' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập về nhà', weight: 30 },
            { type: 'Kiểm tra giữa kỳ', weight: 25 },
            { type: 'Thi cuối kỳ', weight: 35 }
        ],
        materials: [
            { name: 'Probability and Statistics for Engineering', author: 'Ronald E. Walpole', type: 'Chính' },
            { name: 'Introduction to Probability', author: 'Joseph K. Blitzstein, Jessica Hwang', type: 'Tham khảo' }
        ]
    },
    {
        code: 'SE201',
        name: 'Kiểm thử phần mềm',
        author: 'ThS. Nguyễn Quang Minh',
        title: 'Đề cương môn Kiểm thử phần mềm',
        department: 'Khoa Kỹ thuật Phần mềm',
        type: 'Bắt buộc',
        version: '2.3',
        datePublished: '2024-01-20',
        semester: 5,
        academicYear: '2024-2025',
        content: 'Nguyên lý kiểm thử, kỹ thuật thiết kế test case, kiểm thử đơn vị, tích hợp, hệ thống, tự động hóa kiểm thử.',
        url: 'https://example.com/syllabus/SE201.pdf',
        description: 'Kỹ năng và phương pháp kiểm thử phần mềm chuyên nghiệp.',
        aiSummary: 'Đào tạo chuyên sâu về các phương pháp và công cụ kiểm thử phần mềm.',
        credits: 3,
        prerequisites: ['SE101', 'OOP236'],
        studentmission: [
            '- Sinh viên phải tham dự tối thiểu 80% số tiết của học phần',
            '- Làm và nộp các bài tập / báo cáo / làm việc nhóm / thuyết trình....đúng thời gian quy định',
            '- Tự nghiên cứu các vấn đề được giao ở nhà hoặc thư viện',
            '- Hoàn thành các bài đánh giá quá trình; kết thúc học phần.'],
        target: [
            'Nắm vững các nguyên lý và quy trình kiểm thử phần mềm',
            'Phát triển kỹ năng thiết kế test case hiệu quả',
            'Thành thạo công cụ kiểm thử tự động',
            'Áp dụng kiểm thử trong phát triển phần mềm thực tế'
        ],
        clos: [
            'Hiểu các nguyên lý và mức độ kiểm thử',
            'Thiết kế test case hiệu quả',
            'Áp dụng công cụ kiểm thử tự động'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO4', 'PLO6'] },
            { clo: 'CLO2', plos: ['PLO5', 'PLO7'] },
            { clo: 'CLO3', plos: ['PLO8', 'PLO9'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['SE201', 'SE301', 'QA401', 'AT501']
        },
        teachingPlan: [
            { week: 1, topic: 'Nguyên lý kiểm thử phần mềm', method: 'Thuyết giảng' },
            { week: 2, topic: 'Kỹ thuật thiết kế test case', method: 'Thực hành' },
            { week: 3, topic: 'Kiểm thử đơn vị với JUnit', method: 'Thảo luận' },
            { week: 4, topic: 'Kiểm thử tích hợp', method: 'Thực hành lab' },
            { week: 5, topic: 'Kiểm thử hệ thống và chấp nhận', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'Tự động hóa kiểm thử với Selenium', method: 'Thực hành' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập thực hành', weight: 30 },
            { type: 'Dự án kiểm thử', weight: 30 },
            { type: 'Thi cuối kỳ', weight: 30 }
        ],
        materials: [
            { name: 'Foundations of Software Testing', author: 'Dorothy Graham, Erik van Veenendaal', type: 'Chính' },
            { name: 'The Art of Software Testing', author: 'Glenford J. Myers', type: 'Tham khảo' }
        ]
    },
    {
        code: 'DB301',
        name: 'Hệ quản trị cơ sở dữ liệu',
        author: 'TS. Hoàng Văn Tùng',
        title: 'Đề cương môn Hệ quản trị cơ sở dữ liệu',
        department: 'Khoa Hệ thống Thông tin',
        type: 'Bắt buộc',
        version: '2.5',
        datePublished: '2024-01-25',
        semester: 6,
        academicYear: '2024-2025',
        content: 'SQL nâng cao, thiết kế database, normalization, transaction, concurrency control, indexing, performance tuning.',
        url: 'https://example.com/syllabus/DB301.pdf',
        description: 'Quản lý và tối ưu hệ thống cơ sở dữ liệu doanh nghiệp.',
        aiSummary: 'Chuyên sâu về quản trị và tối ưu hiệu suất cơ sở dữ liệu.',
        credits: 3,
        prerequisites: ['CT101', 'TH202'],
        studentmission: [
            '- Sinh viên phải tham dự tối thiểu 80% số tiết của học phần',
            '- Làm và nộp các bài tập / báo cáo / làm việc nhóm / thuyết trình....đúng thời gian quy định',
            '- Tự nghiên cứu các vấn đề được giao ở nhà hoặc thư viện',
            '- Hoàn thành các bài đánh giá quá trình; kết thúc học phần.'],
        target: [
            'Thành thạo kỹ thuật thiết kế và tối ưu cơ sở dữ liệu',
            'Nắm vững quản lý transaction và kiểm soát đồng thời',
            'Phát triển kỹ năng tối ưu hiệu suất truy vấn',
            'Ứng dụng quản trị CSDL trong môi trường doanh nghiệp'
        ],
        clos: [
            'Thiết kế database chuẩn hóa',
            'Viết truy vấn SQL phức tạp',
            'Quản lý transaction và concurrency'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO5', 'PLO8'] },
            { clo: 'CLO2', plos: ['PLO6', 'PLO9'] },
            { clo: 'CLO3', plos: ['PLO7', 'PLO10'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['DB301', 'BD401', 'DW501', 'DB601']
        },
        teachingPlan: [
            { week: 1, topic: 'Review SQL và database design', method: 'Thuyết giảng' },
            { week: 2, topic: 'Normalization và optimization', method: 'Thực hành' },
            { week: 3, topic: 'Transaction và ACID properties', method: 'Thảo luận' },
            { week: 4, topic: 'Concurrency control', method: 'Thực hành lab' },
            { week: 5, topic: 'Indexing và query optimization', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'Backup và recovery', method: 'Thực hành' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập SQL', weight: 25 },
            { type: 'Dự án database', weight: 35 },
            { type: 'Thi cuối kỳ', weight: 30 }
        ],
        materials: [
            { name: 'Database System Concepts', author: 'Abraham Silberschatz, Henry F. Korth', type: 'Chính' },
            { name: 'SQL Performance Explained', author: 'Markus Winand', type: 'Tham khảo' }
        ]
    },
    {
        code: 'NW401',
        name: 'Mạng máy tính',
        author: 'TS. Phạm Thanh Bình',
        title: 'Đề cương môn Mạng máy tính',
        department: 'Khoa Mạng và Truyền thông',
        type: 'Bắt buộc',
        version: '2.0',
        datePublished: '2024-02-01',
        semester: 7,
        academicYear: '2024-2025',
        content: 'Mô hình OSI/TCP-IP, địa chỉ IP, routing, switching, network security, wireless networks, network management.',
        url: 'https://example.com/syllabus/NW401.pdf',
        description: 'Kiến thức toàn diện về mạng máy tính và bảo mật.',
        aiSummary: 'Hiểu biết sâu về kiến trúc mạng, giao thức và bảo mật.',
        credits: 3,
        prerequisites: ['IT102'],
        studentmission: [
            '- Sinh viên phải tham dự tối thiểu 80% số tiết của học phần',
            '- Làm và nộp các bài tập / báo cáo / làm việc nhóm / thuyết trình....đúng thời gian quy định',
            '- Tự nghiên cứu các vấn đề được giao ở nhà hoặc thư viện',
            '- Hoàn thành các bài đánh giá quá trình; kết thúc học phần.'],
        target: [
            'Hiểu rõ kiến trúc mạng và các giao thức truyền thông',
            'Thành thạo cấu hình và quản trị mạng cơ bản',
            'Nắm vững nguyên lý bảo mật mạng',
            'Phát triển kỹ năng xử lý sự cố mạng'
        ],
        clos: [
            'Hiểu mô hình OSI và TCP/IP',
            'Cấu hình mạng cơ bản',
            'Phân tích vấn đề bảo mật mạng'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO6', 'PLO10'] },
            { clo: 'CLO2', plos: ['PLO7', 'PLO11'] },
            { clo: 'CLO3', plos: ['PLO8', 'PLO12'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['NW401', 'NS501', 'CL601', 'SDN701']
        },
        teachingPlan: [
            { week: 1, topic: 'Giới thiệu mạng máy tính', method: 'Thuyết giảng' },
            { week: 2, topic: 'Mô hình OSI và TCP/IP', method: 'Thực hành' },
            { week: 3, topic: 'Địa chỉ IP và subnetting', method: 'Thảo luận' },
            { week: 4, topic: 'Routing và switching', method: 'Thực hành lab' },
            { week: 5, topic: 'Network security cơ bản', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'Wireless networks', method: 'Thực hành' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài lab cấu hình mạng', weight: 30 },
            { type: 'Dự án mô phỏng mạng', weight: 30 },
            { type: 'Thi cuối kỳ', weight: 30 }
        ],
        materials: [
            { name: 'Computer Networking: A Top-Down Approach', author: 'James F. Kurose, Keith W. Ross', type: 'Chính' },
            { name: 'CCNA Routing and Switching Official Cert Guide', author: 'Wendell Odom', type: 'Tham khảo' }
        ]
    },
    {
        code: 'PM301',
        name: 'Quản lý dự án phần mềm',
        author: 'ThS. Đỗ Thị Ngọc Ánh',
        title: 'Đề cương môn Quản lý dự án phần mềm',
        department: 'Khoa Quản lý Công nghệ',
        type: 'Tự chọn',
        version: '1.6',
        datePublished: '2024-02-05',
        semester: 8,
        academicYear: '2024-2025',
        content: 'Quy trình quản lý dự án, lập kế hoạch, ước lượng, quản lý rủi ro, quản lý nhóm, agile methodology, scrum.',
        url: 'https://example.com/syllabus/PM301.pdf',
        description: 'Kỹ năng quản lý dự án phần mềm chuyên nghiệp.',
        aiSummary: 'Đào tạo phương pháp quản lý dự án phần mềm theo chuẩn quốc tế.',
        credits: 3,
        prerequisites: ['SE101'],
        studentmission: [
            '- Sinh viên phải tham dự tối thiểu 80% số tiết của học phần',
            '- Làm và nộp các bài tập / báo cáo / làm việc nhóm / thuyết trình....đúng thời gian quy định',
            '- Tự nghiên cứu các vấn đề được giao ở nhà hoặc thư viện',
            '- Hoàn thành các bài đánh giá quá trình; kết thúc học phần.'],
        target: [
            'Nắm vững quy trình quản lý dự án phần mềm chuyên nghiệp',
            'Phát triển kỹ năng lập kế hoạch và ước lượng dự án',
            'Thành thạo phương pháp Agile và Scrum',
            'Nâng cao kỹ năng quản lý nhóm và giao tiếp'
        ],
        clos: [
            'Lập kế hoạch dự án phần mềm',
            'Ước lượng chi phí và thời gian',
            'Áp dụng agile methodology'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO9', 'PLO12'] },
            { clo: 'CLO2', plos: ['PLO10', 'PLO13'] },
            { clo: 'CLO3', plos: ['PLO11', 'PLO14'] }
        ],
        subjectRelationship: {
            type: 'text',
            value: 'Kết hợp với SE101, SE201, SE301 cho chuyên ngành phần mềm'
        },
        teachingPlan: [
            { week: 1, topic: 'Giới thiệu quản lý dự án', method: 'Thuyết giảng' },
            { week: 2, topic: 'Lập kế hoạch dự án', method: 'Thực hành' },
            { week: 3, topic: 'Ước lượng và lập ngân sách', method: 'Thảo luận' },
            { week: 4, topic: 'Quản lý rủi ro', method: 'Thực hành lab' },
            { week: 5, topic: 'Agile và Scrum methodology', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'Quản lý nhóm và giao tiếp', method: 'Thực hành' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Bài tập kế hoạch dự án', weight: 30 },
            { type: 'Dự án nhóm quản lý', weight: 40 },
            { type: 'Thi cuối kỳ', weight: 20 }
        ],
        materials: [
            { name: 'Software Project Management', author: 'Bob Hughes, Mike Cotterell', type: 'Chính' },
            { name: 'Agile Project Management with Scrum', author: 'Ken Schwaber', type: 'Tham khảo' }
        ]
    },
    {
        code: 'IS501',
        name: 'Hệ thống thông tin doanh nghiệp',
        author: 'TS. Trương Văn Hùng',
        title: 'Đề cương môn Hệ thống thông tin doanh nghiệp',
        department: 'Khoa Hệ thống Thông tin',
        type: 'Tự chọn',
        version: '1.4',
        datePublished: '2024-02-10',
        semester: 8,
        academicYear: '2024-2025',
        content: 'ERP systems, CRM, SCM, business intelligence, data warehousing, enterprise architecture, IT governance.',
        url: 'https://example.com/syllabus/IS501.pdf',
        description: 'Hiểu biết về hệ thống thông tin trong doanh nghiệp hiện đại.',
        aiSummary: 'Kiến thức tổng quan về hệ thống thông tin doanh nghiệp và quản lý dữ liệu.',
        credits: 3,
        prerequisites: ['DB301', 'SE101'],
        studentmission: [
            '- Sinh viên phải tham dự tối thiểu 80% số tiết của học phần',
            '- Làm và nộp các bài tập / báo cáo / làm việc nhóm / thuyết trình....đúng thời gian quy định',
            '- Tự nghiên cứu các vấn đề được giao ở nhà hoặc thư viện',
            '- Hoàn thành các bài đánh giá quá trình; kết thúc học phần.'],
        target: [
            'Hiểu rõ kiến trúc và vai trò của hệ thống thông tin doanh nghiệp',
            'Nắm vững các hệ thống ERP, CRM và SCM',
            'Phát triển kỹ năng phân tích và đề xuất giải pháp BI',
            'Ứng dụng IT governance trong quản lý doanh nghiệp'
        ],
        clos: [
            'Hiểu kiến trúc hệ thống doanh nghiệp',
            'Phân tích nhu cầu hệ thống ERP',
            'Đánh giá giải pháp business intelligence'
        ],
        cloPloLinks: [
            { clo: 'CLO1', plos: ['PLO10', 'PLO13'] },
            { clo: 'CLO2', plos: ['PLO11', 'PLO14'] },
            { clo: 'CLO3', plos: ['PLO12', 'PLO15'] }
        ],
        subjectRelationship: {
            type: 'tree',
            value: ['IS501', 'BI601', 'EA701', 'GD801']
        },
        teachingPlan: [
            { week: 1, topic: 'Giới thiệu hệ thống thông tin doanh nghiệp', method: 'Thuyết giảng' },
            { week: 2, topic: 'ERP systems và modules', method: 'Thực hành' },
            { week: 3, topic: 'CRM và SCM systems', method: 'Thảo luận' },
            { week: 4, topic: 'Business Intelligence', method: 'Thực hành lab' },
            { week: 5, topic: 'Data warehousing', method: 'Thuyết giảng + Thực hành' },
            { week: 6, topic: 'IT governance và compliance', method: 'Thực hành' }
        ],
        assessments: [
            { type: 'Chuyên cần', weight: 10 },
            { type: 'Case study phân tích hệ thống', weight: 30 },
            { type: 'Dự án đề xuất giải pháp ERP', weight: 40 },
            { type: 'Thi cuối kỳ', weight: 20 }
        ],
        materials: [
            { name: 'Enterprise Information Systems', author: 'David L. Olson', type: 'Chính' },
            { name: 'Business Intelligence Guidebook', author: 'Rick Sherman', type: 'Tham khảo' }
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
// NEW FUNCTION: Get syllabus by semester
export function getSyllabusBySemester(semester: number): Syllabus[] {
    return SYLLABUS_CONTENT.filter(syllabus => syllabus.semester === semester);
}

// NEW FUNCTION: Get all semesters available
export function getAllSemesters(): number[] {
    const semesters = new Set<number>();
    SYLLABUS_CONTENT.forEach(syllabus => {
        if (syllabus.semester) {
            semesters.add(syllabus.semester);
        }
    });
    return Array.from(semesters).sort((a, b) => a - b);
}

// NEW FUNCTION: Validate prerequisites based on semester
export function validatePrerequisitesSemester(code: string): boolean {
    const syllabus = getSyllabusByCode(code);
    if (!syllabus || !syllabus.prerequisites) return true;

    for (const prereqCode of syllabus.prerequisites) {
        const prereq = getSyllabusByCode(prereqCode);
        if (prereq && prereq.semester >= syllabus.semester) {
            return false; // Prerequisite is in the same or a later semester
        }
    }
    return true;
}