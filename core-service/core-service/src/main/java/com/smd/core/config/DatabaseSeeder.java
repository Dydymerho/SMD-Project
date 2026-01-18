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

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("🚀 STARTING DATABASE SEEDING...");

        // --- PHẦN 1: USER & ROLE ---
        initRoles();
        initUsers();

        // --- PHẦN 2: ACADEMIC DATA (Thay thế init-course.sql) ---
        initDepartmentsAndPrograms();
        initCourses();

        // --- PHẦN 3: SYLLABUS DATA (Thay thế init-syllabus.sql) ---
        initSyllabi();

        log.info("✅ DATABASE SEEDING COMPLETED.");
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
        createUser("admin", "admin@smd.edu.vn", "System Administrator", commonPass, "ADMIN");
        createUser("lecturer", "lecturer@smd.edu.vn", "Nguyen Van A", commonPass, "LECTURER");
        createUser("lecturer2", "lecturer2@smd.edu.vn", "Tran Thi B", commonPass, "LECTURER");
        createUser("head_dept", "head.dept@smd.edu.vn", "Head of IT Dept", commonPass, "HEAD_OF_DEPARTMENT");
        createUser("student", "student@smd.edu.vn", "Le Van C", commonPass, "STUDENT");
    }

    private void createUser(String username, String email, String fullName, String rawPass, String roleName) {
        if (userRepository.findByUsername(username).isPresent()) return;

        User user = User.builder()
                .username(username)
                .email(email)
                .fullName(fullName)
                .passwordHash(passwordEncoder.encode(rawPass))
                .status(User.UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        User savedUser = userRepository.save(user);

        Role role = roleRepository.findByRoleName(roleName).orElseThrow();
        userRoleRepository.save(UserRole.builder().user(savedUser).role(role).build());
        log.info("   + Created User: {}", username);
    }

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

    private void initCourses() {
        // Tìm Khoa CNTT để gán môn học
        Department itDept = departmentRepository.findAll().stream()
                .filter(d -> d.getDeptName().contains("Cong Nghe")).findFirst().orElse(null);

        if (itDept != null) {
            createCourse("PRF192", "Programming Fundamentals", 3, itDept);
            createCourse("PRO192", "Object-Oriented Programming", 3, itDept);
            createCourse("JPD113", "Java Programming", 3, itDept);
            createCourse("SWE201", "Introduction to Software Engineering", 3, itDept);
        }
    }

    private void createCourse(String code, String name, int credits, Department department) {
        if (courseRepository.findByCourseCode(code).isPresent()) return;

        Course course = Course.builder()
                .courseCode(code)
                .courseName(name)
                .credits(credits)
                .department(department)
                .build();
        
        courseRepository.save(course);
        log.info("   + Created Course: {} - {}", code, name);
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
}