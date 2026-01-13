-- =====================================================
-- INIT SAMPLE DATA: 6 SYLLABUSES
-- Compatible with: Fixed Entity Schema (No invalid columns)
-- Dependencies: init-course.sql, init-role-user.sql
-- =====================================================

-- =====================================================
-- BLOCK 1: SETUP CONSTRAINTS & INDEXES (Safe to run multiple times)
-- =====================================================
DO $$ 
BEGIN
    -- 1. Create Unique Index to support ON CONFLICT
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_syllabus_unique_version') THEN
        CREATE UNIQUE INDEX idx_syllabus_unique_version ON syllabus (course_id, academic_year, version_no);
    END IF;

    -- 2. Fix Enum Constraints
    -- Syllabus Status
    ALTER TABLE syllabus DROP CONSTRAINT IF EXISTS syllabus_current_status_check;
    ALTER TABLE syllabus ADD CONSTRAINT syllabus_current_status_check 
    CHECK (current_status IN ('DRAFT', 'PENDING_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'ARCHIVED'));
    
    -- Material Type
    ALTER TABLE material DROP CONSTRAINT IF EXISTS material_material_type_check;
    ALTER TABLE material ADD CONSTRAINT material_material_type_check 
    CHECK (material_type IN ('TEXTBOOK', 'REFERENCE_BOOK', 'JOURNAL', 'WEBSITE', 'VIDEO', 'OTHER'));

    RAISE NOTICE 'Schema constraints ensured.';
END $$;

-- =====================================================
-- BLOCK 2: INSERT 6 SYLLABUSES
-- =====================================================

DO $$
DECLARE
    v_lecturer_id BIGINT;
    v_cs_prog_id BIGINT;
    v_ba_prog_id BIGINT;
    
    -- Variables for processing
    r RECORD;
    v_course_id BIGINT;
    v_syllabus_id BIGINT;
BEGIN
    -- Get Common IDs
    SELECT user_id INTO v_lecturer_id FROM "user" WHERE username = 'lecturer';
    SELECT program_id INTO v_cs_prog_id FROM program WHERE program_name = 'Bachelor of Computer Science';
    SELECT program_id INTO v_ba_prog_id FROM program WHERE program_name = 'Bachelor of Business Administration';

    -- ================================================================================================
    -- 1. CS102: Data Structures and Algorithms (Status: PENDING_REVIEW)
    -- ================================================================================================
    SELECT course_id INTO v_course_id FROM course WHERE course_code = 'CS102';
    
    IF v_course_id IS NOT NULL THEN
        -- Insert Syllabus
        INSERT INTO syllabus (course_id, lecturer_id, program_id, academic_year, version_no, current_status, created_at, updated_at, is_latest_version, version_notes)
        VALUES (v_course_id, v_lecturer_id, v_cs_prog_id, '2024-2025', 1, 'PENDING_REVIEW', NOW(), NOW(), true, 'Submitted for review')
        ON CONFLICT (course_id, academic_year, version_no) DO NOTHING
        RETURNING syllabus_id INTO v_syllabus_id;
        
        -- Fallback ID
        IF v_syllabus_id IS NULL THEN SELECT syllabus_id INTO v_syllabus_id FROM syllabus WHERE course_id = v_course_id AND version_no = 1; END IF;

        IF v_syllabus_id IS NOT NULL THEN
             -- Cleanup old data
            DELETE FROM clo WHERE syllabus_id = v_syllabus_id;
            DELETE FROM assessment WHERE syllabus_id = v_syllabus_id;
            DELETE FROM material WHERE syllabus_id = v_syllabus_id;

            -- CLOs
            INSERT INTO clo (syllabus_id, clo_code, clo_description) VALUES
            (v_syllabus_id, 'CLO1', 'Analyze algorithm complexity using Big-O notation'),
            (v_syllabus_id, 'CLO2', 'Implement linear data structures (Stack, Queue, Linked List)'),
            (v_syllabus_id, 'CLO3', 'Apply tree and graph structures to solve problems');

            -- Assessments
            INSERT INTO assessment (syllabus_id, name, weight_percent, criteria) VALUES
            (v_syllabus_id, 'Midterm Exam', 30, 'Covers linear structures and complexity analysis'),
            (v_syllabus_id, 'Final Exam', 40, 'Covers trees, graphs, and sorting algorithms'),
            (v_syllabus_id, 'Lab Assignments', 30, 'Weekly implementation tasks in C++');

            -- Materials
            INSERT INTO material (syllabus_id, material_type, title, author) VALUES
            (v_syllabus_id, 'TEXTBOOK', 'Introduction to Algorithms', 'Thomas H. Cormen'),
            (v_syllabus_id, 'WEBSITE', 'GeeksforGeeks DSA', 'GFG Team');
            
            RAISE NOTICE 'Created Syllabus for CS102';
        END IF;
    END IF;

    -- ================================================================================================
    -- 2. CS201: Database Management Systems (Status: DRAFT)
    -- ================================================================================================
    SELECT course_id INTO v_course_id FROM course WHERE course_code = 'CS201';
    
    IF v_course_id IS NOT NULL THEN
        INSERT INTO syllabus (course_id, lecturer_id, program_id, academic_year, version_no, current_status, created_at, updated_at, is_latest_version, version_notes)
        VALUES (v_course_id, v_lecturer_id, v_cs_prog_id, '2024-2025', 1, 'DRAFT', NOW(), NOW(), true, 'Initial draft')
        ON CONFLICT (course_id, academic_year, version_no) DO NOTHING
        RETURNING syllabus_id INTO v_syllabus_id;
        
        IF v_syllabus_id IS NULL THEN SELECT syllabus_id INTO v_syllabus_id FROM syllabus WHERE course_id = v_course_id AND version_no = 1; END IF;

        IF v_syllabus_id IS NOT NULL THEN
            DELETE FROM clo WHERE syllabus_id = v_syllabus_id; DELETE FROM assessment WHERE syllabus_id = v_syllabus_id; DELETE FROM material WHERE syllabus_id = v_syllabus_id;

            INSERT INTO clo (syllabus_id, clo_code, clo_description) VALUES
            (v_syllabus_id, 'CLO1', 'Design ER diagrams for real-world scenarios'),
            (v_syllabus_id, 'CLO2', 'Write complex SQL queries for data retrieval'),
            (v_syllabus_id, 'CLO3', 'Apply normalization to database schemas');

            INSERT INTO assessment (syllabus_id, name, weight_percent, criteria) VALUES
            (v_syllabus_id, 'Database Project', 40, 'Design and implement a full DB system'),
            (v_syllabus_id, 'Final Exam', 40, 'Theory of relational databases'),
            (v_syllabus_id, 'Quizzes', 20, 'Pop quizzes on SQL syntax');

            INSERT INTO material (syllabus_id, material_type, title, author) VALUES
            (v_syllabus_id, 'TEXTBOOK', 'Database System Concepts', 'Abraham Silberschatz'),
            (v_syllabus_id, 'WEBSITE', 'PostgreSQL Documentation', 'PostgreSQL Global Group');
            
            RAISE NOTICE 'Created Syllabus for CS201';
        END IF;
    END IF;

    -- ================================================================================================
    -- 3. CS202: Object-Oriented Programming (Status: APPROVED)
    -- ================================================================================================
    SELECT course_id INTO v_course_id FROM course WHERE course_code = 'CS202';
    
    IF v_course_id IS NOT NULL THEN
        INSERT INTO syllabus (course_id, lecturer_id, program_id, academic_year, version_no, current_status, created_at, updated_at, is_latest_version, version_notes)
        VALUES (v_course_id, v_lecturer_id, v_cs_prog_id, '2024-2025', 1, 'APPROVED', NOW(), NOW(), true, 'Approved by HOD')
        ON CONFLICT (course_id, academic_year, version_no) DO NOTHING
        RETURNING syllabus_id INTO v_syllabus_id;
        
        IF v_syllabus_id IS NULL THEN SELECT syllabus_id INTO v_syllabus_id FROM syllabus WHERE course_id = v_course_id AND version_no = 1; END IF;

        IF v_syllabus_id IS NOT NULL THEN
            DELETE FROM clo WHERE syllabus_id = v_syllabus_id; DELETE FROM assessment WHERE syllabus_id = v_syllabus_id; DELETE FROM material WHERE syllabus_id = v_syllabus_id;

            INSERT INTO clo (syllabus_id, clo_code, clo_description) VALUES
            (v_syllabus_id, 'CLO1', 'Understand OOP principles: Encapsulation, Inheritance, Polymorphism'),
            (v_syllabus_id, 'CLO2', 'Apply Design Patterns in Java'),
            (v_syllabus_id, 'CLO3', 'Develop robust applications using Java Streams and Lambdas');

            INSERT INTO assessment (syllabus_id, name, weight_percent, criteria) VALUES
            (v_syllabus_id, 'Practical Exam', 30, 'Live coding session'),
            (v_syllabus_id, 'Final Theory', 40, 'Multiple choice and essay questions'),
            (v_syllabus_id, 'Group Project', 30, 'Build a management app');

            INSERT INTO material (syllabus_id, material_type, title, author) VALUES
            (v_syllabus_id, 'TEXTBOOK', 'Effective Java', 'Joshua Bloch'),
            (v_syllabus_id, 'REFERENCE_BOOK', 'Head First Design Patterns', 'Eric Freeman');

            RAISE NOTICE 'Created Syllabus for CS202';
        END IF;
    END IF;

    -- ================================================================================================
    -- 4. CS301: Software Engineering (Status: PUBLISHED)
    -- ================================================================================================
    SELECT course_id INTO v_course_id FROM course WHERE course_code = 'CS301';
    
    IF v_course_id IS NOT NULL THEN
        INSERT INTO syllabus (course_id, lecturer_id, program_id, academic_year, version_no, current_status, created_at, updated_at, published_at, is_latest_version, version_notes)
        VALUES (v_course_id, v_lecturer_id, v_cs_prog_id, '2024-2025', 1, 'PUBLISHED', NOW(), NOW(), NOW(), true, 'Official release')
        ON CONFLICT (course_id, academic_year, version_no) DO NOTHING
        RETURNING syllabus_id INTO v_syllabus_id;
        
        IF v_syllabus_id IS NULL THEN SELECT syllabus_id INTO v_syllabus_id FROM syllabus WHERE course_id = v_course_id AND version_no = 1; END IF;

        IF v_syllabus_id IS NOT NULL THEN
            DELETE FROM clo WHERE syllabus_id = v_syllabus_id; DELETE FROM assessment WHERE syllabus_id = v_syllabus_id; DELETE FROM material WHERE syllabus_id = v_syllabus_id;

            INSERT INTO clo (syllabus_id, clo_code, clo_description) VALUES
            (v_syllabus_id, 'CLO1', 'Apply SDLC models (Agile, Waterfall) to projects'),
            (v_syllabus_id, 'CLO2', 'Gather and analyze software requirements'),
            (v_syllabus_id, 'CLO3', 'Perform software testing (Unit, Integration, System)');

            INSERT INTO assessment (syllabus_id, name, weight_percent, criteria) VALUES
            (v_syllabus_id, 'Capstone Project', 50, 'Full semester group project'),
            (v_syllabus_id, 'Midterm', 20, 'Requirements engineering'),
            (v_syllabus_id, 'Final', 30, 'Testing and maintenance');

            INSERT INTO material (syllabus_id, material_type, title, author) VALUES
            (v_syllabus_id, 'TEXTBOOK', 'Software Engineering', 'Ian Sommerville'),
            (v_syllabus_id, 'VIDEO', 'Agile Crash Course', 'Udemy');

            RAISE NOTICE 'Created Syllabus for CS301';
        END IF;
    END IF;

    -- ================================================================================================
    -- 5. CS302: Web Development (Status: DRAFT)
    -- ================================================================================================
    SELECT course_id INTO v_course_id FROM course WHERE course_code = 'CS302';
    
    IF v_course_id IS NOT NULL THEN
        INSERT INTO syllabus (course_id, lecturer_id, program_id, academic_year, version_no, current_status, created_at, updated_at, is_latest_version, version_notes)
        VALUES (v_course_id, v_lecturer_id, v_cs_prog_id, '2024-2025', 1, 'DRAFT', NOW(), NOW(), true, 'Planning phase')
        ON CONFLICT (course_id, academic_year, version_no) DO NOTHING
        RETURNING syllabus_id INTO v_syllabus_id;
        
        IF v_syllabus_id IS NULL THEN SELECT syllabus_id INTO v_syllabus_id FROM syllabus WHERE course_id = v_course_id AND version_no = 1; END IF;

        IF v_syllabus_id IS NOT NULL THEN
            DELETE FROM clo WHERE syllabus_id = v_syllabus_id; DELETE FROM assessment WHERE syllabus_id = v_syllabus_id; DELETE FROM material WHERE syllabus_id = v_syllabus_id;

            INSERT INTO clo (syllabus_id, clo_code, clo_description) VALUES
            (v_syllabus_id, 'CLO1', 'Build responsive UI using HTML5, CSS3, and JavaScript'),
            (v_syllabus_id, 'CLO2', 'Develop SPA using ReactJS'),
            (v_syllabus_id, 'CLO3', 'Create RESTful APIs with Node.js');

            INSERT INTO assessment (syllabus_id, name, weight_percent, criteria) VALUES
            (v_syllabus_id, 'Frontend Assignment', 30, 'Responsive Layout'),
            (v_syllabus_id, 'Backend Assignment', 30, 'API Implementation'),
            (v_syllabus_id, 'Final Project', 40, 'Full stack e-commerce site');

            INSERT INTO material (syllabus_id, material_type, title, author) VALUES
            (v_syllabus_id, 'WEBSITE', 'MDN Web Docs', 'Mozilla'),
            (v_syllabus_id, 'WEBSITE', 'React Documentation', 'Meta');

            RAISE NOTICE 'Created Syllabus for CS302';
        END IF;
    END IF;

    -- ================================================================================================
    -- 6. BA101: Principles of Management (Status: PUBLISHED)
    -- ================================================================================================
    SELECT course_id INTO v_course_id FROM course WHERE course_code = 'BA101';
    
    IF v_course_id IS NOT NULL THEN
        INSERT INTO syllabus (course_id, lecturer_id, program_id, academic_year, version_no, current_status, created_at, updated_at, published_at, is_latest_version, version_notes)
        VALUES (v_course_id, v_lecturer_id, v_ba_prog_id, '2024-2025', 1, 'PUBLISHED', NOW(), NOW(), NOW(), true, 'Approved for BA program')
        ON CONFLICT (course_id, academic_year, version_no) DO NOTHING
        RETURNING syllabus_id INTO v_syllabus_id;
        
        IF v_syllabus_id IS NULL THEN SELECT syllabus_id INTO v_syllabus_id FROM syllabus WHERE course_id = v_course_id AND version_no = 1; END IF;

        IF v_syllabus_id IS NOT NULL THEN
            DELETE FROM clo WHERE syllabus_id = v_syllabus_id; DELETE FROM assessment WHERE syllabus_id = v_syllabus_id; DELETE FROM material WHERE syllabus_id = v_syllabus_id;

            INSERT INTO clo (syllabus_id, clo_code, clo_description) VALUES
            (v_syllabus_id, 'CLO1', 'Define key management concepts'),
            (v_syllabus_id, 'CLO2', 'Analyze organizational structures'),
            (v_syllabus_id, 'CLO3', 'Apply leadership theories in case studies');

            INSERT INTO assessment (syllabus_id, name, weight_percent, criteria) VALUES
            (v_syllabus_id, 'Case Study Analysis', 30, 'Written report on a company'),
            (v_syllabus_id, 'Midterm', 30, 'Theory definitions'),
            (v_syllabus_id, 'Final Exam', 40, 'Comprehensive essay questions');

            INSERT INTO material (syllabus_id, material_type, title, author) VALUES
            (v_syllabus_id, 'TEXTBOOK', 'Management Principles', 'Stephen Robbins'),
            (v_syllabus_id, 'JOURNAL', 'Harvard Business Review', 'HBR');

            RAISE NOTICE 'Created Syllabus for BA101';
        END IF;
    END IF;

    RAISE NOTICE 'SUCCESS: 6 Syllabuses have been created/updated.';
END $$;