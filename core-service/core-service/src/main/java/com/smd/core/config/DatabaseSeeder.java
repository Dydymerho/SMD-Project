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
        initUsers(); // Đã thêm student vào đây

        // --- BƯỚC 2: DỮ LIỆU ĐÀO TẠO ---
        initPLOs();
        initCourses();
        initCourseRelations();

        // --- BƯỚC 3: SYLLABUS & CHI TIẾT ---
        initSyllabi();
        initSyllabusDetails();

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
        Department itDept = departmentRepository.findAll().stream()
                .filter(d -> d.getDeptName().equals("Khoa Cong Nghe Thong Tin")).findFirst().orElse(null);

        // 1. Admin
        createUser("admin", "admin@smd.edu.vn", "System Administrator", commonPass, "ADMIN", null);
        
        // 2. Lecturers
        createUser("lecturer", "lecturer@smd.edu.vn", "Nguyen Van A", commonPass, "LECTURER", itDept);
        createUser("lecturer2", "lecturer2@smd.edu.vn", "Tran Thi B", commonPass, "LECTURER", itDept);
        
        // 3. Head of Department
        createUser("head_dept", "head.dept@smd.edu.vn", "Truong Khoa IT", commonPass, "HEAD_OF_DEPARTMENT", itDept);
        
        // 4. Student (Đã thêm theo yêu cầu)
        createUser("student", "student@smd.edu.vn", "Le Van C", commonPass, "STUDENT", itDept);

        // Cập nhật Head cho Department sau khi tạo user
        if (itDept != null) {
            Optional<User> head = userRepository.findByUsername("head_dept");
            if (head.isPresent()) {
                itDept.setHeadOfDepartment(head.get());
                departmentRepository.save(itDept);
            }
        }
    }

    private void createUser(String username, String email, String fullName, String rawPass, String roleName, Department dept) {
        if (userRepository.findByUsername(username).isPresent()) return;

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
    }

    // ==========================================
    // PHẦN 2: ACADEMIC DATA
    // ==========================================
    private void initDepartmentsAndPrograms() {
        Department itDept = createDepartmentIfNotFound("Khoa Cong Nghe Thong Tin");
        createProgramIfNotFound("Ky thuat Phan mem", itDept);
        createProgramIfNotFound("An toan Thong tin", itDept);
    }

    private Department createDepartmentIfNotFound(String deptName) {
        return departmentRepository.findAll().stream()
                .filter(d -> d.getDeptName().equals(deptName))
                .findFirst()
                .orElseGet(() -> departmentRepository.save(Department.builder().deptName(deptName).build()));
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
    }

    private void createPLO(Program program, String code, String desc) {
        ploRepository.save(PLO.builder()
                .program(program).ploCode(code).ploDescription(desc)
                .build());
        log.info("   + Created PLO: {}", code);
    }

    private void initCourses() {
        Department itDept = departmentRepository.findAll().stream()
                .filter(d -> d.getDeptName().equals("Khoa Cong Nghe Thong Tin")).findFirst().orElse(null);

        if (itDept != null) {
            createCourse("PRF192", "Programming Fundamentals", 3, itDept);
            createCourse("PRO192", "Object-Oriented Programming", 3, itDept);
            createCourse("JPD113", "Java Programming", 3, itDept);
        }
    }

    private void createCourse(String code, String name, int credits, Department dept) {
        if (courseRepository.findByCourseCode(code).isPresent()) return;
        courseRepository.save(Course.builder().courseCode(code).courseName(name).credits(credits).department(dept).build());
        log.info("   + Created Course: {}", code);
    }

    private void initCourseRelations() {
        Optional<Course> prfOpt = courseRepository.findByCourseCode("PRF192");
        Optional<Course> proOpt = courseRepository.findByCourseCode("PRO192");

        if (prfOpt.isPresent() && proOpt.isPresent()) {
            Course pro = proOpt.get();
            Course prf = prfOpt.get();

            if (pro.getPrerequisiteRelations() == null || pro.getPrerequisiteRelations().isEmpty()) {
                CourseRelation relation = CourseRelation.builder()
                        .course(pro)
                        .relatedCourse(prf)
                        .relationType(CourseRelation.RelationType.PREREQUISITE)
                        .build();

                List<CourseRelation> relations = new ArrayList<>();
                relations.add(relation);
                pro.setPrerequisiteRelations(relations);
                
                courseRepository.save(pro);
                log.info("   + Created Relation: PRF192 is Prerequisite of PRO192");
            }
        }
    }

    // ==========================================
    // PHẦN 3: SYLLABUS & DETAILS
    // ==========================================
    private void initSyllabi() {
        User lecturer = userRepository.findByUsername("lecturer").orElse(null);
        Program seProgram = programRepository.findAll().stream()
                .filter(p -> p.getProgramName().contains("Phan mem")).findFirst().orElse(null);
        
        if (lecturer == null || seProgram == null) return;

        createSyllabusBase("JPD113", "2024-2025", 1, lecturer, seProgram);
        createSyllabusBase("PRO192", "2024-2025", 1, lecturer, seProgram);
    }

    private void createSyllabusBase(String courseCode, String year, int ver, User lecturer, Program program) {
        Course course = courseRepository.findByCourseCode(courseCode).orElse(null);
        if (course == null) return;

        if (syllabusRepository.existsByCourse_CourseIdAndAcademicYearAndVersionNo(course.getCourseId(), year, ver)) return;

        Syllabus syllabus = Syllabus.builder()
                .course(course).lecturer(lecturer).program(program)
                .academicYear(year).versionNo(ver)
                .currentStatus(Syllabus.SyllabusStatus.DRAFT)
                .isLatestVersion(true)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();
        syllabusRepository.save(syllabus);
        log.info("   + Created Syllabus Base: {}", courseCode);
    }

    private void initSyllabusDetails() {
        // Lấy Syllabus môn Java (JPD113)
        Course javaCourse = courseRepository.findByCourseCode("JPD113").orElse(null);
        if (javaCourse == null) return;

        Optional<Syllabus> syllabusOpt = syllabusRepository.findLatestVersionByCourseAndYear(javaCourse.getCourseId(), "2024-2025");
        
        if (syllabusOpt.isPresent()) {
            Syllabus syllabus = syllabusOpt.get();

            // 1. Material
            if (materialRepository.findBySyllabus_SyllabusId(syllabus.getSyllabusId()).isEmpty()) {
                materialRepository.save(Material.builder().syllabus(syllabus).title("Core Java Volume I").author("Cay S. Horstmann").materialType(Material.MaterialType.TEXTBOOK).build());
                materialRepository.save(Material.builder().syllabus(syllabus).title("Effective Java").author("Joshua Bloch").materialType(Material.MaterialType.REFERENCE_BOOK).build());
                log.info("     > Added Materials");
            }

            // 2. Session Plans
            if (sessionPlanRepository.findBySyllabus_SyllabusId(syllabus.getSyllabusId()).isEmpty()) {
                sessionPlanRepository.save(SessionPlan.builder().syllabus(syllabus).weekNo(1).topic("Intro to Java").teachingMethod("Lecture").build());
                sessionPlanRepository.save(SessionPlan.builder().syllabus(syllabus).weekNo(2).topic("OOP Concepts").teachingMethod("Lecture & Lab").build());
                sessionPlanRepository.save(SessionPlan.builder().syllabus(syllabus).weekNo(3).topic("Exception Handling").teachingMethod("Workshop").build());
                log.info("     > Added Session Plans");
            }

            // 3. Assessment
            if (assessmentRepository.findBySyllabus_SyllabusId(syllabus.getSyllabusId()).isEmpty()) {
                assessmentRepository.save(Assessment.builder().syllabus(syllabus).name("Progress Test 1").weightPercent(20f).criteria("Multiple Choice").build());
                assessmentRepository.save(Assessment.builder().syllabus(syllabus).name("Practical Exam").weightPercent(40f).criteria("Coding").build());
                assessmentRepository.save(Assessment.builder().syllabus(syllabus).name("Final Exam").weightPercent(40f).criteria("Multiple Choice").build());
                log.info("     > Added Assessments");
            }

            // 4. CLO & Mapping
            if (cloRepository.findBySyllabus_SyllabusId(syllabus.getSyllabusId()).isEmpty()) {
                List<PLO> plos = ploRepository.findByProgram_ProgramId(syllabus.getProgram().getProgramId());
                
                // CLO 1
                CLO clo1 = CLO.builder().syllabus(syllabus).cloCode("CLO1").cloDescription("Understand Java Syntax").build();
                if (!plos.isEmpty()) {
                    List<CLOPLOMapping> mappings = new ArrayList<>();
                    mappings.add(CLOPLOMapping.builder().clo(clo1).plo(plos.get(0)).mappingLevel(CLOPLOMapping.MappingLevel.HIGH).build());
                    clo1.setPloMappings(mappings);
                }
                cloRepository.save(clo1);

                // CLO 2
                CLO clo2 = CLO.builder().syllabus(syllabus).cloCode("CLO2").cloDescription("Apply OOP principles").build();
                if (plos.size() > 1) {
                    List<CLOPLOMapping> mappings = new ArrayList<>();
                    mappings.add(CLOPLOMapping.builder().clo(clo2).plo(plos.get(1)).mappingLevel(CLOPLOMapping.MappingLevel.MEDIUM).build());
                    clo2.setPloMappings(mappings);
                }
                cloRepository.save(clo2);
                log.info("     > Added CLOs & Mappings");
            }
        }
    }

    // ==========================================
    // PHẦN 4: INTERACTION & AI
    // ==========================================
    private void initInteractions() {
        Course javaCourse = courseRepository.findByCourseCode("JPD113").orElse(null);
        if (javaCourse == null) return;

        Optional<Syllabus> syllabusOpt = syllabusRepository.findLatestVersionByCourseAndYear(javaCourse.getCourseId(), "2024-2025");
        User headDept = userRepository.findByUsername("head_dept").orElse(null);
        User lecturer = userRepository.findByUsername("lecturer").orElse(null);

        if (syllabusOpt.isPresent() && headDept != null && lecturer != null) {
            Syllabus syllabus = syllabusOpt.get();

            // Review Comment
            if (reviewCommentRepository.findBySyllabusOrderByCreatedAtDesc(syllabus).isEmpty()) {
                reviewCommentRepository.save(ReviewComment.builder()
                        .syllabus(syllabus)
                        .user(headDept)
                        .content("Cần bổ sung thêm tài liệu tham khảo mới hơn.")
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build());
                log.info("   + Created Review Comment");
            }

            // Notification
            if (notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(lecturer).isEmpty()) {
                notificationRepository.save(Notification.builder()
                        .recipient(lecturer)
                        .syllabus(syllabus)
                        .type(Notification.NotificationType.COMMENT_ADDED)
                        .title("Nhận xét mới")
                        .message("Trưởng khoa đã thêm nhận xét vào đề cương JPD113.")
                        .triggeredBy(headDept.getUsername())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build());
                log.info("   + Created Notification");
            }
        }
    }

    private void initAiTasks() {
        Course javaCourse = courseRepository.findByCourseCode("JPD113").orElse(null);
        if (javaCourse == null) return;

        Optional<Syllabus> syllabusOpt = syllabusRepository.findLatestVersionByCourseAndYear(javaCourse.getCourseId(), "2024-2025");
        if (syllabusOpt.isPresent()) {
            Syllabus syllabus = syllabusOpt.get();
            if (aiTaskRepository.findBySyllabus_SyllabusId(syllabus.getSyllabusId()).isEmpty()) {
                aiTaskRepository.save(AITask.builder()
                        .syllabus(syllabus)
                        .taskType(AITask.TaskType.GENERATE_CLO)
                        .status(AITask.TaskStatus.COMPLETED)
                        .resultSummary("AI generated 5 CLOs based on course description.")
                        .createdAt(LocalDateTime.now())
                        .build());
                log.info("   + Created AI Task");
            }
        }
    }
}