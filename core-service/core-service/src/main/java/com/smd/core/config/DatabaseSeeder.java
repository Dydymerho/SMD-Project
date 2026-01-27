package com.smd.core.config;

import com.smd.core.entity.*;
import com.smd.core.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

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
    private final PLORepository ploRepository;

    // 3. Syllabus Core Repositories
    private final SyllabusRepository syllabusRepository;
    private final AiTaskRepository aiTaskRepository;

    // 4. Syllabus Detail Repositories
    private final MaterialRepository materialRepository;
    private final SessionPlanRepository sessionPlanRepository;
    private final AssessmentRepository assessmentRepository;
    private final CLORepository cloRepository;

    // 5. Interaction Repositories
    private final ReviewCommentRepository reviewCommentRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("STARTING DATABASE SEEDING...");

        // --- BƯỚC 1: CẤU HÌNH CƠ BẢN ---
        initRoles();
        initDepartmentsAndPrograms();
        initUsers();

        // --- BƯỚC 2: DỮ LIỆU ĐÀO TẠO ---
        initPLOs();
        initCourses();
        initCourseRelations();

        // --- BƯỚC 3: SYLLABUS & CHI TIẾT ---
        initSyllabi();
        // initSyllabusDetails(); // Gọi bên trong initSyllabi để tiện quản lý

        // --- BƯỚC 4: TƯƠNG TÁC ---
        initInteractions();
        initAiTasks();

        log.info("DATABASE SEEDING COMPLETED.");
    }

    // ==========================================
    // PHẦN 1: USER & ROLE
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
        Department itDept = getDepartment("Khoa Cong Nghe Thong Tin");
        Department bizDept = getDepartment("Khoa Quan Tri Kinh Doanh");
        Department designDept = getDepartment("Khoa Thiet Ke Do Hoa");

        // 1. Admin & Managers
        createUser("admin", "admin@smd.edu.vn", "System Administrator", commonPass, "ADMIN", null);
        createUser("academic_staff", "aa@smd.edu.vn", "Academic Affairs Manager", commonPass, "ACADEMIC_AFFAIRS", null);
        createUser("principal", "principal@smd.edu.vn", "Hieu Truong", commonPass, "PRINCIPAL", null);

        // 2. Head of Departments
        User headIT = createUser("head_it", "head.it@smd.edu.vn", "Truong Khoa IT", commonPass, "HEAD_OF_DEPARTMENT", itDept);
        User headBiz = createUser("head_biz", "head.biz@smd.edu.vn", "Truong Khoa Kinh Doanh", commonPass, "HEAD_OF_DEPARTMENT", bizDept);
        
        // 3. Lecturers
        createUser("lecturer_it1", "lecturer.it1@smd.edu.vn", "Nguyen Van A (IT)", commonPass, "LECTURER", itDept);
        createUser("lecturer_it2", "lecturer.it2@smd.edu.vn", "Tran Thi B (IT)", commonPass, "LECTURER", itDept);
        createUser("lecturer_biz", "lecturer.biz@smd.edu.vn", "Le Van C (Biz)", commonPass, "LECTURER", bizDept);
        createUser("lecturer_design", "lecturer.design@smd.edu.vn", "Pham Thi D (Design)", commonPass, "LECTURER", designDept);
        
        // 4. Student
        createUser("student", "student@smd.edu.vn", "Nguyen Sinh Vien", commonPass, "STUDENT", itDept);

        // Update Head for Department
        updateDeptHead(itDept, headIT);
        updateDeptHead(bizDept, headBiz);
    }

    private User createUser(String username, String email, String fullName, String rawPass, String roleName, Department dept) {
        if (userRepository.findByUsername(username).isPresent()) {
            return userRepository.findByUsername(username).get();
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .fullName(fullName)
                .passwordHash(passwordEncoder.encode(rawPass))
                .status(User.UserStatus.ACTIVE)
                .department(dept)
                .createdAt(LocalDateTime.now())
                .build();
        User savedUser = userRepository.save(user);

        Role role = roleRepository.findByRoleName(roleName).orElseThrow();
        userRoleRepository.save(UserRole.builder().user(savedUser).role(role).build());
        log.info("   + Created User: {} ({})", username, roleName);
        return savedUser;
    }

    private void updateDeptHead(Department dept, User head) {
        if (dept != null && head != null) {
            dept.setHeadOfDepartment(head);
            departmentRepository.save(dept);
        }
    }

    // ==========================================
    // PHẦN 2: ACADEMIC DATA
    // ==========================================
    private void initDepartmentsAndPrograms() {
        // IT
        Department itDept = createDepartmentIfNotFound("Khoa Cong Nghe Thong Tin");
        createProgramIfNotFound("Ky thuat Phan mem", itDept);
        createProgramIfNotFound("An toan Thong tin", itDept);
        createProgramIfNotFound("He thong Thong tin", itDept);

        // Business
        Department bizDept = createDepartmentIfNotFound("Khoa Quan Tri Kinh Doanh");
        createProgramIfNotFound("Digital Marketing", bizDept);
        createProgramIfNotFound("Quan tri Kinh doanh Quoc te", bizDept);

        // Design
        Department designDept = createDepartmentIfNotFound("Khoa Thiet Ke Do Hoa");
        createProgramIfNotFound("Thiet ke Do hoa", designDept);
    }

    private Department createDepartmentIfNotFound(String deptName) {
        return departmentRepository.findAll().stream()
                .filter(d -> d.getDeptName().equals(deptName))
                .findFirst()
                .orElseGet(() -> departmentRepository.save(Department.builder().deptName(deptName).build()));
    }
    
    private Department getDepartment(String name) {
        return departmentRepository.findAll().stream()
                .filter(d -> d.getDeptName().equals(name))
                .findFirst().orElse(null);
    }

    private Program createProgramIfNotFound(String programName, Department dept) {
        return programRepository.findAll().stream()
                .filter(p -> p.getProgramName().equals(programName))
                .findFirst()
                .orElseGet(() -> programRepository.save(Program.builder().programName(programName).department(dept).build()));
    }

    private void initPLOs() {
        Program seProgram = programRepository.findAll().stream()
                .filter(p -> p.getProgramName().equals("Ky thuat Phan mem")).findFirst().orElse(null);

        if (seProgram != null && ploRepository.findByProgram_ProgramId(seProgram.getProgramId()).isEmpty()) {
            createPLO(seProgram, "PLO1", "Áp dụng kiến thức toán học, khoa học và kỹ thuật.");
            createPLO(seProgram, "PLO2", "Thiết kế và tiến hành thực nghiệm, phân tích dữ liệu.");
            createPLO(seProgram, "PLO3", "Thiết kế hệ thống, thành phần hoặc quy trình đáp ứng nhu cầu.");
            createPLO(seProgram, "PLO4", "Hoạt động hiệu quả trong các nhóm đa ngành.");
            createPLO(seProgram, "PLO5", "Nhận diện, diễn đạt và giải quyết các vấn đề kỹ thuật.");
        }
        
        Program mktProgram = programRepository.findAll().stream()
                .filter(p -> p.getProgramName().equals("Digital Marketing")).findFirst().orElse(null);
        if (mktProgram != null && ploRepository.findByProgram_ProgramId(mktProgram.getProgramId()).isEmpty()) {
             createPLO(mktProgram, "PLO1", "Hiểu biết về thị trường và hành vi khách hàng.");
             createPLO(mktProgram, "PLO2", "Lập kế hoạch Digital Marketing hiệu quả.");
        }
    }

    private void createPLO(Program program, String code, String desc) {
        ploRepository.save(PLO.builder()
                .program(program).ploCode(code).ploDescription(desc)
                .build());
    }

    private void initCourses() {
        Department itDept = getDepartment("Khoa Cong Nghe Thong Tin");
        Department bizDept = getDepartment("Khoa Quan Tri Kinh Doanh");
        Department designDept = getDepartment("Khoa Thiet Ke Do Hoa");

        // IT Courses
        if (itDept != null) {
            createCourse("PRF192", "Programming Fundamentals", 3, itDept);
            createCourse("PRO192", "Object-Oriented Programming", 3, itDept);
            createCourse("JPD113", "Java Programming", 3, itDept);
            createCourse("DBI202", "Database Systems", 3, itDept);
            createCourse("WED201c", "Web Design & Development", 3, itDept);
            createCourse("CSD201", "Data Structures & Algorithms", 3, itDept);
            createCourse("SWR302", "Software Requirements", 3, itDept);
        }

        // Business Courses
        if (bizDept != null) {
            createCourse("MKT101", "Marketing Fundamentals", 3, bizDept);
            createCourse("ECO111", "Microeconomics", 3, bizDept);
            createCourse("OBM202", "Organizational Behavior", 3, bizDept);
        }
        
        // Design Courses
        if (designDept != null) {
            createCourse("DES101", "Color Theory", 3, designDept);
            createCourse("PHO102", "Photography Basics", 2, designDept);
        }
    }

    private void createCourse(String code, String name, int credits, Department dept) {
        if (courseRepository.findByCourseCode(code).isPresent()) return;
        courseRepository.save(Course.builder().courseCode(code).courseName(name).credits(credits).department(dept).build());
        log.info("   + Created Course: {}", code);
    }

    private void initCourseRelations() {
        createRelation("PRF192", "PRO192", CourseRelation.RelationType.PREREQUISITE);
        createRelation("PRO192", "CSD201", CourseRelation.RelationType.PREREQUISITE);
        createRelation("DBI202", "SWR302", CourseRelation.RelationType.PREREQUISITE);
    }
    
    private void createRelation(String preCode, String targetCode, CourseRelation.RelationType type) {
        Optional<Course> preOpt = courseRepository.findByCourseCode(preCode);
        Optional<Course> targetOpt = courseRepository.findByCourseCode(targetCode);
        
        if (preOpt.isPresent() && targetOpt.isPresent()) {
            Course target = targetOpt.get();
            Course pre = preOpt.get();
            
            // Check existing simple logic
            if (target.getPrerequisiteRelations() != null && !target.getPrerequisiteRelations().isEmpty()) return;

            CourseRelation relation = CourseRelation.builder()
                    .course(target)
                    .relatedCourse(pre)
                    .relationType(type)
                    .build();
            
            // Note: In a real app, you might maintain a list, but here we just save/update
            // Hibernate might need the collection initialized, but for seeding simplify:
            List<CourseRelation> list = new ArrayList<>();
            list.add(relation);
            target.setPrerequisiteRelations(list);
            courseRepository.save(target);
            log.info("   + Created Relation: {} -> {}", preCode, targetCode);
        }
    }

    // ==========================================
    // PHẦN 3: SYLLABUS & DETAILS
    // ==========================================
    private void initSyllabi() {
        User lecIT1 = userRepository.findByUsername("lecturer_it1").orElse(null);
        User lecIT2 = userRepository.findByUsername("lecturer_it2").orElse(null);
        User lecBiz = userRepository.findByUsername("lecturer_biz").orElse(null);
        User lecDesign = userRepository.findByUsername("lecturer_design").orElse(null);
        
        Program seProgram = programRepository.findAll().stream().filter(p -> p.getProgramName().contains("Phan mem")).findFirst().orElse(null);
        Program mktProgram = programRepository.findAll().stream().filter(p -> p.getProgramName().contains("Marketing")).findFirst().orElse(null);
        Program designProgram = programRepository.findAll().stream().filter(p -> p.getProgramName().contains("Thiet ke")).findFirst().orElse(null);

        if (lecIT1 == null) return;

        // 1. DRAFT Syllabi
        Syllabus s1 = createSyllabusWithDetails("JPD113", "2024-2025", 1, lecIT1, seProgram, Syllabus.SyllabusStatus.DRAFT);
        createSyllabusWithDetails("PRO192", "2025-2026", 1, lecIT1, seProgram, Syllabus.SyllabusStatus.DRAFT);
        
        // 2. PENDING_REVIEW (Chờ trưởng bộ môn duyệt)
        createSyllabusWithDetails("DBI202", "2024-2025", 1, lecIT2, seProgram, Syllabus.SyllabusStatus.PENDING_REVIEW);
        
        // 3. APPROVED (Đã được duyệt, chờ xuất bản)
        createSyllabusWithDetails("MKT101", "2024-2025", 1, lecBiz, mktProgram, Syllabus.SyllabusStatus.APPROVED);
        
        // 4. PUBLISHED (Đã công khai)
        Syllabus sWeb = createSyllabusWithDetails("WED201c", "2024-2025", 2, lecIT1, seProgram, Syllabus.SyllabusStatus.PUBLISHED);
        createSyllabusWithDetails("DES101", "2024-2025", 1, lecDesign, designProgram, Syllabus.SyllabusStatus.PUBLISHED);
        
        // 5. ARCHIVED (Syllabus cũ)
        createSyllabusWithDetails("WED201c", "2023-2024", 1, lecIT1, seProgram, Syllabus.SyllabusStatus.ARCHIVED);
    }

    private Syllabus createSyllabusWithDetails(String courseCode, String year, int ver, User lecturer, Program program, Syllabus.SyllabusStatus status) {
        Course course = courseRepository.findByCourseCode(courseCode).orElse(null);
        if (course == null || lecturer == null) return null;

        if (syllabusRepository.existsByCourse_CourseIdAndAcademicYearAndVersionNo(course.getCourseId(), year, ver)) {
            return syllabusRepository.findByCourse_CourseIdAndAcademicYearAndVersionNo(course.getCourseId(), year, ver).orElse(null);
        }

        boolean isLatest = (status != Syllabus.SyllabusStatus.ARCHIVED);

        Syllabus syllabus = Syllabus.builder()
                .course(course).lecturer(lecturer).program(program)
                .academicYear(year).versionNo(ver)
                .currentStatus(status)
                .isLatestVersion(isLatest)
                .createdAt(LocalDateTime.now().minusDays(new Random().nextInt(30)))
                .updatedAt(LocalDateTime.now())
                .build();
        
        if (status == Syllabus.SyllabusStatus.PUBLISHED) {
            syllabus.setPublishedAt(LocalDateTime.now());
        }
        
        Syllabus saved = syllabusRepository.save(syllabus);
        log.info("   + Created Syllabus: {} v{} [{}]", courseCode, ver, status);
        
        // Add Details automatically
        addMaterials(saved);
        addSessionPlans(saved);
        addAssessments(saved);
        addCLOs(saved);
        
        return saved;
    }

    private void addMaterials(Syllabus s) {
        if (s.getCourse().getCourseCode().startsWith("JPD")) {
            materialRepository.save(Material.builder().syllabus(s).title("Core Java Volume I").author("Cay S. Horstmann").materialType(Material.MaterialType.TEXTBOOK).build());
        } else if (s.getCourse().getCourseCode().startsWith("MKT")) {
            materialRepository.save(Material.builder().syllabus(s).title("Marketing Management").author("Philip Kotler").materialType(Material.MaterialType.TEXTBOOK).build());
        } else {
             materialRepository.save(Material.builder().syllabus(s).title("General Resource for " + s.getCourse().getCourseCode()).author("Multiple Authors").materialType(Material.MaterialType.REFERENCE_BOOK).build());
        }
    }

    private void addSessionPlans(Syllabus s) {
        for (int i = 1; i <= 5; i++) {
            sessionPlanRepository.save(SessionPlan.builder()
                    .syllabus(s).weekNo(i).topic("Topic Week " + i + ": Fundamentals").teachingMethod("Lecture & Activity").build());
        }
    }

    private void addAssessments(Syllabus s) {
        assessmentRepository.save(Assessment.builder().syllabus(s).name("Quiz 1").weightPercent(10f).criteria("MCQ").build());
        assessmentRepository.save(Assessment.builder().syllabus(s).name("Midterm Exam").weightPercent(30f).criteria("Written").build());
        assessmentRepository.save(Assessment.builder().syllabus(s).name("Final Exam").weightPercent(60f).criteria("Project/Exam").build());
    }

    private void addCLOs(Syllabus s) {
        List<PLO> plos = s.getProgram() != null ? ploRepository.findByProgram_ProgramId(s.getProgram().getProgramId()) : new ArrayList<>();
        
        for (int i = 1; i <= 3; i++) {
            CLO clo = CLO.builder()
                    .syllabus(s)
                    .cloCode("CLO" + i)
                    .cloDescription("Student will be able to demonstrate skill level " + i + " in " + s.getCourse().getCourseName())
                    .build();
            
            // Simple mapping logic
            if (!plos.isEmpty()) {
                List<CLOPLOMapping> mappings = new ArrayList<>();
                mappings.add(CLOPLOMapping.builder().clo(clo).plo(plos.get(i % plos.size())).mappingLevel(CLOPLOMapping.MappingLevel.HIGH).build());
                clo.setPloMappings(mappings);
            }
            cloRepository.save(clo);
        }
    }

    // ==========================================
    // PHẦN 4: INTERACTION & AI
    // ==========================================
    private void initInteractions() {
        Department itDept = getDepartment("Khoa Cong Nghe Thong Tin");
        if (itDept == null || itDept.getHeadOfDepartment() == null) return;
        
        List<Syllabus> pendingSyllabi = syllabusRepository.findByCurrentStatus(Syllabus.SyllabusStatus.PENDING_REVIEW);
        User head = itDept.getHeadOfDepartment();

        for (Syllabus s : pendingSyllabi) {
            if (s.getCourse().getDepartment().getDepartmentId().equals(itDept.getDepartmentId())) {
                reviewCommentRepository.save(ReviewComment.builder()
                        .syllabus(s)
                        .user(head)
                        .content("Đề cương cần chi tiết hơn ở phần đánh giá.")
                        .createdAt(LocalDateTime.now().minusHours(2))
                        .build());
                
                notificationRepository.save(Notification.builder()
                        .recipient(s.getLecturer())
                        .syllabus(s)
                        .type(Notification.NotificationType.COMMENT_ADDED)
                        .title("Yêu cầu chỉnh sửa")
                        .message("Trưởng bộ môn đã nhận xét đề cương " + s.getCourse().getCourseCode())
                        .triggeredBy(head.getUsername())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build());
            }
        }
    }

    private void initAiTasks() {
        List<Syllabus> allSyllabi = syllabusRepository.findAll();
        Random rand = new Random();

        for (Syllabus s : allSyllabi) {
            // Randomly assign AI tasks
            if (rand.nextBoolean()) {
                aiTaskRepository.save(AITask.builder()
                        .syllabus(s)
                        .taskType(AITask.TaskType.GENERATE_CLO)
                        .status(AITask.TaskStatus.COMPLETED)
                        .resultSummary("AI created 5 CLOs successfully.")
                        .createdAt(LocalDateTime.now().minusDays(5))
                        .build());
            }
            
            if (s.getCurrentStatus() == Syllabus.SyllabusStatus.DRAFT && rand.nextBoolean()) {
                aiTaskRepository.save(AITask.builder()
                        .syllabus(s)
                        .taskType(AITask.TaskType.GRAMMAR_CHECK)
                        .status(AITask.TaskStatus.COMPLETED)
                        .resultSummary("Found 3 typo errors in Description.")
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build());
            }

            if (s.getCurrentStatus() == Syllabus.SyllabusStatus.PENDING_REVIEW) {
                aiTaskRepository.save(AITask.builder()
                        .syllabus(s)
                        .taskType(AITask.TaskType.SUGGEST_ASSESSMENT)
                        .status(AITask.TaskStatus.IN_PROGRESS)
                        .createdAt(LocalDateTime.now())
                        .build());
            }
        }
        log.info("   + Created AI Tasks for random syllabi");
    }
}