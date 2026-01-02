export const subjectDetailMock = {
    generalInfo: {
        name: "Software Engineering",
        code: "SE101",
        credits: 3,
        faculty: "Công nghệ thông tin",
        description:
            "Học phần cung cấp kiến thức nền tảng về quy trình phát triển phần mềm."
    },

    aiSummary:
        "Môn học giúp sinh viên hiểu vòng đời phát triển phần mềm, từ phân tích yêu cầu đến triển khai và bảo trì.",

    clo: [
        "CLO1: Hiểu các khái niệm cơ bản về công nghệ phần mềm",
        "CLO2: Áp dụng mô hình phát triển phần mềm",
        "CLO3: Phân tích và thiết kế hệ thống đơn giản"
    ],

    cloPloMapping: [
        "CLO1 → PLO1, PLO3",
        "CLO2 → PLO2",
        "CLO3 → PLO4"
    ],

    teachingPlan: [
        { week: 1, topic: "Giới thiệu SE", method: "Thuyết giảng" },
        { week: 2, topic: "Software Process", method: "Thảo luận nhóm" }
    ],

    assessment: [
        "Chuyên cần: 10%",
        "Giữa kỳ: 30%",
        "Cuối kỳ: 40%",
        "Bài tập: 20%"
    ],

    materials: [
        {
            name: "Software Engineering – Sommerville",
            author: "Ian Sommerville",
            type: "Tài liệu chính"
        },
        {
            name: "Clean Code",
            author: "Robert C. Martin",
            type: "Tài liệu tham khảo"
        }
    ]
};
