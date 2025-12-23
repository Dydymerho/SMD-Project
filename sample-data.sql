-- Script to create sample data for testing Syllabus API
-- Run this file: docker exec -i smd_postgres psql -U root -d smd_db < sample-data.sql

-- 1. Create Department
INSERT INTO department (dept_name) 
VALUES ('Computer Science')
ON CONFLICT DO NOTHING;

-- 2. Create Program (no program_code and total_credits columns in actual table)
INSERT INTO program (program_name, department_id)
VALUES ('Software Engineering', 1)
ON CONFLICT DO NOTHING;

-- 3. Create Course
INSERT INTO course (course_code, course_name, credits, department_id)
VALUES ('CS101', 'Introduction to Programming', 3, 1)
ON CONFLICT (course_code) DO NOTHING;

INSERT INTO course (course_code, course_name, credits, department_id)
VALUES ('CS102', 'Data Structures', 4, 1)
ON CONFLICT (course_code) DO NOTHING;

INSERT INTO course (course_code, course_name, credits, department_id)
VALUES ('CS201', 'Database Systems', 3, 1)
ON CONFLICT (course_code) DO NOTHING;

-- 4. User testuser already exists from authentication test
-- Additional sample users can be created via API

-- 5. Verify data
SELECT 'Departments:' as info, COUNT(*) as count FROM department;
SELECT 'Programs:' as info, COUNT(*) as count FROM program;
SELECT 'Courses:' as info, COUNT(*) as count FROM course;
SELECT 'Users:' as info, COUNT(*) as count FROM "user";

-- Show the data
SELECT * FROM department;
SELECT * FROM program;
SELECT * FROM course;
SELECT user_id, username, full_name, email FROM "user";
