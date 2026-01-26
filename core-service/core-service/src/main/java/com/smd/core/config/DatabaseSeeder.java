package com.smd.core.config;

//
import com.smd.core.entity.*;
import com.smd.core.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    // 1. Auth Repositories
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    // 2. Academic Repositories
    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;
    private final CourseRepository courseRepository;
    private final SyllabusRepository syllabusRepository;

    private final AiTaskRepository aiTaskRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("STARTING DATABASE SEEDING...");

        // --- PHẦN 1: USER & ROLE ---
        initRoles();
        initDepartmentsAndPrograms();
        initUsers();

        // --- PHẦN 2: ACADEMIC DATA (Thay thế init-course.sql) ---
        
        initCourses();

        // --- PHẦN 3: SYLLABUS DATA (Thay thế init-syllabus.sql) ---
        initSyllabi();

        initAiTasks();

        log.info("DATABASE SEEDING COMPLETED.");
    }

    // ==========================================
    // PHẦN 1: USER & ROLE INIT
    // ==========================================
    private void initRoles() {
        String[] roles = {"ADMIN", "LECTURER", "HEAD_OF_DEPARTMENT", "ACADEMIC_AFFAIRS", "PRINCIPAL", "STUDENT"};
        for (String roleName : roles) {
            if (roleRepository.findByRoleName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().roleName(roleName).build());
                log.info("   + Created Role: {}", roleName);
            }
        }
    }


    private void initUsers() {
        String commonPass = "Password123";

        // 1. Lấy Department đã tạo ở bước trước (ví dụ lấy Khoa CNTT)
        Department itDept = departmentRepository.findAll().stream()
                .filter(d -> d.getDeptName().equals("Khoa Cong Nghe Thong Tin"))
                .findFirst()
                .orElse(null);

        // 2. Tạo Admin (Không cần khoa -> truyền null)
        createUser("admin", "admin@smd.edu.vn", "System Administrator", commonPass, "ADMIN", null);

        // 3. Tạo Giảng viên & Sinh viên (Gán vào Khoa CNTT)
        // Nếu itDept bị null thì user vẫn tạo được nhưng department sẽ null
        createUser("lecturer", "lecturer@smd.edu.vn", "Nguyen Van A", commonPass, "LECTURER", itDept);
        createUser("lecturer2", "lecturer2@smd.edu.vn", "Tran Thi B", commonPass, "LECTURER", itDept);
        createUser("head_dept", "head.dept@smd.edu.vn", "Head of IT Dept", commonPass, "HEAD_OF_DEPARTMENT", itDept);
        createUser("student", "student@smd.edu.vn", "Le Van C", commonPass, "STUDENT", itDept);
    }

    // Sửa method này để nhận thêm tham số Department dept
    private void createUser(String username, String email, String fullName, String rawPass, String roleName, Department dept) {
        if (userRepository.findByUsername(username).isPresent()) return;

        User user = User.builder()
                .username(username)
                .email(email)
                .fullName(fullName)
                .passwordHash(passwordEncoder.encode(rawPass))
                .status(User.UserStatus.ACTIVE)
                .department(dept) // <--- QUAN TRỌNG: Gán Department vào đây
                .createdAt(LocalDateTime.now())
                .build();
        User savedUser = userRepository.save(user);

        Role role = roleRepository.findByRoleName(roleName).orElseThrow();
        userRoleRepository.save(UserRole.builder().user(savedUser).role(role).build());
        
        log.info("   + Created User: {} - Dept: {}", username, (dept != null ? dept.getDeptName() : "None"));
    }

    // ...

    // ==========================================
    // PHẦN 2: DEPARTMENT & PROGRAM & COURSE
    // ==========================================
    private void initDepartmentsAndPrograms() {
        // Tạo Khoa CNTT (IT)
        Department itDept = createDepartmentIfNotFound("Khoa Cong Nghe Thong Tin");
        
        // Tạo các ngành thuộc Khoa CNTT
        createProgramIfNotFound("Ky thuat Phan mem", itDept);
        createProgramIfNotFound("An toan Thong tin", itDept);
        createProgramIfNotFound("He thong Thong tin", itDept);

        // Tạo Khoa Kinh Tế (Economics)
        Department ecoDept = createDepartmentIfNotFound("Khoa Quan Tri Kinh Doanh");
        createProgramIfNotFound("Quan tri Kinh doanh", ecoDept);
    }

    private Department createDepartmentIfNotFound(String deptName) {
        // Tìm department theo tên
        List<Department> depts = departmentRepository.findAll();
        for (Department d : depts) {
            if (d.getDeptName().equals(deptName)) return d;
        }
        
        Department dept = Department.builder()
                .deptName(deptName)
                .build();
        log.info("   + Created Department: {}", deptName);
        return departmentRepository.save(dept);
    }

    private Program createProgramIfNotFound(String programName, Department dept) {
        // Kiểm tra sơ bộ tránh trùng lặp
        return programRepository.findAll().stream()
                .filter(p -> p.getProgramName().equals(programName))
                .findFirst()
                .orElseGet(() -> {
                    Program p = Program.builder()
                            .programName(programName)
                            .department(dept)
                            .build();
                    log.info("   + Created Program: {}", programName);
                    return programRepository.save(p);
                });
    }

    // Trong file src/main/java/com/smd/core/config/DatabaseSeeder.java

    private void initCourses() {
        // 1. Lấy Khoa CNTT chính xác theo tên đã tạo
        Department itDept = departmentRepository.findAll().stream()
                .filter(d -> d.getDeptName().equals("Khoa Cong Nghe Thong Tin"))
                .findFirst()
                .orElse(null);
        
        // 2. Lấy Khoa Kinh Tế (nếu muốn tạo thêm môn cho khoa này)
        Department ecoDept = departmentRepository.findAll().stream()
                .filter(d -> d.getDeptName().equals("Khoa Quan Tri Kinh Doanh"))
                .findFirst()
                .orElse(null);

        // 3. Tạo các môn học cho Khoa CNTT
        if (itDept != null) {
            createCourse("PRF192", "Programming Fundamentals", 3, itDept);
            createCourse("PRO192", "Object-Oriented Programming", 3, itDept);
            createCourse("JPD113", "Java Programming", 3, itDept); // Môn này dùng để test Syllabus
            createCourse("SWE201", "Introduction to Software Engineering", 3, itDept);
            createCourse("DBI202", "Database Systems", 3, itDept);
        } else {
            log.warn("⚠ Không tìm thấy 'Khoa Cong Nghe Thong Tin'. Không thể tạo môn học CNTT.");
        }

        // 4. Tạo môn học cho Khoa Kinh Tế (Ví dụ thêm)
        if (ecoDept != null) {
            createCourse("ECO111", "Microeconomics", 3, ecoDept);
        }
    }

    private void createCourse(String code, String name, int credits, Department department) {
        // Kiểm tra môn học đã tồn tại chưa để tránh trùng lặp
        if (courseRepository.findByCourseCode(code).isPresent()) return;

        Course course = Course.builder()
                .courseCode(code)
                .courseName(name)
                .credits(credits)
                .department(department) // GẮN KHOA VÀO ĐÂY
                .build();
        
        courseRepository.save(course);
        log.info("   + Created Course: {} - {} (Dept: {})", code, name, department.getDeptName());
    }

    // ==========================================
    // PHẦN 3: SYLLABUS
    // ==========================================
    private void initSyllabi() {
        // Lấy giảng viên để làm người soạn
        User lecturer = userRepository.findByUsername("lecturer").orElse(null);
        if (lecturer == null) return;

        // Lấy program để gán cho syllabus
        Program seProgram = programRepository.findAll().stream()
                .filter(p -> p.getProgramName().contains("Phan mem")).findFirst().orElse(null);
        if (seProgram == null) return;

        // Tạo Syllabus cho môn Java (JPD113)
        Optional<Course> javaCourse = courseRepository.findByCourseCode("JPD113");
        javaCourse.ifPresent(course -> {
            createSyllabus("2024-2025", 1, course, lecturer, seProgram);
        });

        // Tạo Syllabus cho môn OOP (PRO192)
        Optional<Course> oopCourse = courseRepository.findByCourseCode("PRO192");
        oopCourse.ifPresent(course -> {
            createSyllabus("2024-2025", 1, course, lecturer, seProgram);
        });
    }

    private void createSyllabus(String academicYear, Integer versionNo, Course course, User lecturer, Program program) {
        // Check trùng lặp theo course và academicYear
        boolean exists = syllabusRepository.findAll().stream()
                .anyMatch(s -> s.getCourse().getCourseId().equals(course.getCourseId()) 
                        && s.getAcademicYear().equals(academicYear)
                        && s.getVersionNo().equals(versionNo));
        if (exists) return;

        Syllabus syllabus = Syllabus.builder()
                .course(course)
                .lecturer(lecturer)
                .program(program)
                .academicYear(academicYear)
                .versionNo(versionNo)
                .currentStatus(Syllabus.SyllabusStatus.DRAFT)
                .isLatestVersion(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        syllabusRepository.save(syllabus);
        log.info("   + Created Syllabus for course: {} - Year: {} - Version: {}", 
                course.getCourseCode(), academicYear, versionNo);
    }

    // 3. THÊM ĐOẠN CODE NÀY XUỐNG CUỐI CÙNG CLASS
    private void initAiTasks() {
        // Lấy Syllabus của môn Java (JPD113) để gán dữ liệu mẫu
        courseRepository.findByCourseCode("JPD113").ifPresent(course -> {
            syllabusRepository.findLatestVersionByCourseAndYear(course.getCourseId(), "2024-2025")
                .ifPresent(syllabus -> {
                    
                    // Dữ liệu mẫu cho AI Summary (Kết quả generate CLO)
                    String aiSummaryContent = "Dựa trên mô tả môn học, AI đề xuất 5 chuẩn đầu ra (CLOs):\n" +
                            "1. [CLO-1] Hiểu rõ các nguyên lý cơ bản của lập trình hướng đối tượng (OOP) trong Java.\n" +
                            "2. [CLO-2] Vận dụng được các cấu trúc dữ liệu và giải thuật cơ bản.\n" +
                            "3. [CLO-3] Xây dựng được ứng dụng console hoàn chỉnh quản lý sinh viên.\n" +
                            "4. [CLO-4] Phân tích và xử lý ngoại lệ (Exception Handling) hiệu quả.\n" +
                            "5. [CLO-5] Áp dụng các Best Practices về Clean Code trong Java.";

                    createAITaskIfNotFound(
                        syllabus, 
                        AITask.TaskType.GENERATE_CLO, 
                        AITask.TaskStatus.COMPLETED, 
                        aiSummaryContent
                    );

                    // Dữ liệu mẫu cho Task đang chạy (để test trạng thái loading)
                    createAITaskIfNotFound(
                        syllabus,
                        AITask.TaskType.SUGGEST_ASSESSMENT,
                        AITask.TaskStatus.IN_PROGRESS,
                        null
                    );
                });
        });
    }

    private void createAITaskIfNotFound(Syllabus syllabus, AITask.TaskType type, AITask.TaskStatus status, String resultSummary) {
        // Kiểm tra xem đã có task loại này cho syllabus chưa
        List<AITask> existingTasks = aiTaskRepository.findBySyllabus_SyllabusId(syllabus.getSyllabusId());
        boolean exists = existingTasks.stream().anyMatch(t -> t.getTaskType() == type);

        if (!exists) {
            AITask task = AITask.builder()
                    .syllabus(syllabus)
                    .taskType(type)
                    .status(status)
                    .resultSummary(resultSummary) // Đây chính là dữ liệu sẽ hiện ở field aiResultSummary
                    .createdAt(LocalDateTime.now())
                    .build();
            
            aiTaskRepository.save(task);
            log.info("   + Created AI Task: {} for Syllabus {}", type, syllabus.getCourse().getCourseCode());
        }
    }
}