-- =====================================================
-- Sample Data Initialization Script
-- Creates departments, programs, courses, and workflow steps
-- Written according to actual Entity definitions
-- =====================================================

-- =====================================================
-- STEP 1: CREATE DEPARTMENTS
-- =====================================================
INSERT INTO department (dept_name)
SELECT 'Computer Science'
WHERE NOT EXISTS (SELECT 1 FROM department WHERE dept_name = 'Computer Science')
UNION ALL
SELECT 'Business Administration'
WHERE NOT EXISTS (SELECT 1 FROM department WHERE dept_name = 'Business Administration')
UNION ALL
SELECT 'Engineering'
WHERE NOT EXISTS (SELECT 1 FROM department WHERE dept_name = 'Engineering')
UNION ALL
SELECT 'Mathematics'
WHERE NOT EXISTS (SELECT 1 FROM department WHERE dept_name = 'Mathematics')
UNION ALL
SELECT 'Foreign Languages'
WHERE NOT EXISTS (SELECT 1 FROM department WHERE dept_name = 'Foreign Languages');

-- =====================================================
-- STEP 2: CREATE PROGRAMS
-- =====================================================
INSERT INTO program (program_name, department_id)
SELECT 'Bachelor of Computer Science', 
    (SELECT department_id FROM department WHERE dept_name = 'Computer Science')
WHERE NOT EXISTS (
    SELECT 1 FROM program 
    WHERE program_name = 'Bachelor of Computer Science'
)
UNION ALL
SELECT 'Bachelor of Software Engineering', 
    (SELECT department_id FROM department WHERE dept_name = 'Computer Science')
WHERE NOT EXISTS (
    SELECT 1 FROM program 
    WHERE program_name = 'Bachelor of Software Engineering'
)
UNION ALL
SELECT 'Bachelor of Information Technology', 
    (SELECT department_id FROM department WHERE dept_name = 'Computer Science')
WHERE NOT EXISTS (
    SELECT 1 FROM program 
    WHERE program_name = 'Bachelor of Information Technology'
)
UNION ALL
SELECT 'Bachelor of Business Administration', 
    (SELECT department_id FROM department WHERE dept_name = 'Business Administration')
WHERE NOT EXISTS (
    SELECT 1 FROM program 
    WHERE program_name = 'Bachelor of Business Administration'
)
UNION ALL
SELECT 'Bachelor of Accounting', 
    (SELECT department_id FROM department WHERE dept_name = 'Business Administration')
WHERE NOT EXISTS (
    SELECT 1 FROM program 
    WHERE program_name = 'Bachelor of Accounting'
)
UNION ALL
SELECT 'Bachelor of Mechanical Engineering', 
    (SELECT department_id FROM department WHERE dept_name = 'Engineering')
WHERE NOT EXISTS (
    SELECT 1 FROM program 
    WHERE program_name = 'Bachelor of Mechanical Engineering'
)
UNION ALL
SELECT 'Bachelor of Electrical Engineering', 
    (SELECT department_id FROM department WHERE dept_name = 'Engineering')
WHERE NOT EXISTS (
    SELECT 1 FROM program 
    WHERE program_name = 'Bachelor of Electrical Engineering'
);

-- =====================================================
-- STEP 3: CREATE COURSES
-- =====================================================
-- Computer Science Courses
INSERT INTO course (course_code, course_name, credits, department_id)
SELECT * FROM (VALUES
    ('CS101', 'Introduction to Programming', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Computer Science')),
    ('CS102', 'Data Structures and Algorithms', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Computer Science')),
    ('CS201', 'Database Management Systems', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Computer Science')),
    ('CS202', 'Object-Oriented Programming', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Computer Science')),
    ('CS301', 'Software Engineering', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Computer Science')),
    ('CS302', 'Web Development', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Computer Science')),
    ('BA101', 'Principles of Management', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Business Administration')),
    ('BA102', 'Marketing Fundamentals', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Business Administration')),
    ('ACC101', 'Financial Accounting', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Business Administration')),
    ('ACC102', 'Managerial Accounting', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Business Administration')),
    ('MATH101', 'Calculus I', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Mathematics')),
    ('MATH102', 'Calculus II', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Mathematics')),
    ('MATH201', 'Linear Algebra', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Mathematics')),
    ('MATH202', 'Discrete Mathematics', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Mathematics')),
    ('ENG101', 'English for Academic Purposes', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Foreign Languages')),
    ('ENG102', 'Business English', 3, 
        (SELECT department_id FROM department WHERE dept_name = 'Foreign Languages'))
) AS v(course_code, course_name, credits, department_id)
WHERE NOT EXISTS (
    SELECT 1 FROM course WHERE course.course_code = v.course_code
);

-- =====================================================
-- STEP 4: CREATE WORKFLOW STEPS
-- =====================================================
INSERT INTO workflow_step (step_name, step_order)
SELECT * FROM (VALUES
    ('DRAFT', 1),
    ('DEPARTMENT_REVIEW', 2),
    ('ACADEMIC_REVIEW', 3),
    ('PRINCIPAL_APPROVAL', 4),
    ('APPROVED', 5),
    ('REJECTED', 99)
) AS v(step_name, step_order)
WHERE NOT EXISTS (
    SELECT 1 FROM workflow_step WHERE workflow_step.step_name = v.step_name
);

-- =====================================================
-- STEP 5: CREATE PLOs (Program Learning Outcomes)
-- =====================================================
INSERT INTO plo (plo_code, plo_description, program_id)
SELECT * FROM (VALUES
    ('PLO1-CS', 'Apply knowledge of computing and mathematics to solve complex problems', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Computer Science')),
    ('PLO2-CS', 'Design, implement, and evaluate computer-based systems', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Computer Science')),
    ('PLO3-CS', 'Function effectively as a member or leader of a team', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Computer Science')),
    ('PLO4-CS', 'Communicate effectively with stakeholders', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Computer Science')),
    ('PLO5-CS', 'Recognize professional, ethical, and social responsibilities', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Computer Science')),
    ('PLO1-SE', 'Apply software engineering principles and practices', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Software Engineering')),
    ('PLO2-SE', 'Design and develop software systems', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Software Engineering')),
    ('PLO3-SE', 'Work effectively in software development teams', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Software Engineering')),
    ('PLO1-BA', 'Demonstrate understanding of business principles and practices', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Business Administration')),
    ('PLO2-BA', 'Apply analytical and critical thinking skills to business problems', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Business Administration')),
    ('PLO3-BA', 'Demonstrate effective leadership and teamwork skills', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Business Administration')),
    ('PLO4-BA', 'Communicate effectively in business contexts', 
        (SELECT program_id FROM program WHERE program_name = 'Bachelor of Business Administration'))
) AS v(plo_code, plo_description, program_id)
WHERE NOT EXISTS (
    SELECT 1 FROM plo WHERE plo.plo_code = v.plo_code
);

-- =====================================================
-- STEP 6: UPDATE USERS WITH DEPARTMENTS
-- =====================================================
UPDATE "user" SET department_id = (SELECT department_id FROM department WHERE dept_name = 'Computer Science')
WHERE username = 'lecturer' AND department_id IS NULL;

UPDATE "user" SET department_id = (SELECT department_id FROM department WHERE dept_name = 'Computer Science')
WHERE username = 'head_dept' AND department_id IS NULL;

UPDATE "user" SET department_id = (SELECT department_id FROM department WHERE dept_name = 'Business Administration')
WHERE username = 'academic' AND department_id IS NULL;

-- =====================================================
-- STEP 7: VERIFICATION QUERIES
-- =====================================================

-- Verify Counts
SELECT 'DEPARTMENTS' as entity, COUNT(*) as count FROM department
UNION ALL
SELECT 'PROGRAMS', COUNT(*) FROM program
UNION ALL
SELECT 'COURSES', COUNT(*) FROM course
UNION ALL
SELECT 'WORKFLOW_STEPS', COUNT(*) FROM workflow_step
UNION ALL
SELECT 'PLOS', COUNT(*) FROM plo;

-- Show Department Details
SELECT 
    d.department_id,
    d.dept_name,
    COUNT(DISTINCT p.program_id) as program_count,
    COUNT(DISTINCT c.course_id) as course_count,
    COUNT(DISTINCT u.user_id) as user_count
FROM department d
LEFT JOIN program p ON d.department_id = p.department_id
LEFT JOIN course c ON d.department_id = c.department_id
LEFT JOIN "user" u ON d.department_id = u.department_id
GROUP BY d.department_id, d.dept_name
ORDER BY d.dept_name;

-- Show Programs with Departments
SELECT 
    p.program_id,
    p.program_name,
    d.dept_name as department,
    COUNT(plo.plo_id) as plo_count
FROM program p
JOIN department d ON p.department_id = d.department_id
LEFT JOIN plo ON p.program_id = plo.program_id
GROUP BY p.program_id, p.program_name, d.dept_name
ORDER BY d.dept_name, p.program_name;

-- Show Courses with Departments
SELECT 
    c.course_code,
    c.course_name,
    c.credits,
    d.dept_name as department
FROM course c
JOIN department d ON c.department_id = d.department_id
ORDER BY c.course_code;

-- Show Workflow Steps
SELECT step_id, step_name, step_order
FROM workflow_step
ORDER BY step_order;

-- Show PLOs
SELECT 
    plo.plo_code,
    plo.plo_description,
    p.program_name
FROM plo
JOIN program p ON plo.program_id = p.program_id
ORDER BY p.program_name, plo.plo_code;

-- Show Users with Departments
SELECT 
    u.username,
    u.full_name,
    d.dept_name as department,
    r.role_name
FROM "user" u
LEFT JOIN department d ON u.department_id = d.department_id
LEFT JOIN user_role ur ON u.user_id = ur.user_id
LEFT JOIN role r ON ur.role_id = r.role_id
ORDER BY u.username;

-- =====================================================
-- SUMMARY
-- =====================================================
-- ✅ 5 Departments created
-- ✅ 7 Programs created
-- ✅ 16 Courses created
-- ✅ 6 Workflow steps created
-- ✅ 12 PLOs created
-- ✅ Users updated with departments
-- =====================================================