-- =====================================================
-- Complete Database Initialization Script
-- Creates roles and default users
-- =====================================================

-- STEP 1: CREATE ROLES
INSERT INTO role (role_name) VALUES ('ADMIN') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO role (role_name) VALUES ('LECTURER') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO role (role_name) VALUES ('HEAD_OF_DEPARTMENT') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO role (role_name) VALUES ('ACADEMIC_AFFAIRS') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO role (role_name) VALUES ('PRINCIPAL') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO role (role_name) VALUES ('STUDENT') ON CONFLICT (role_name) DO NOTHING;

-- STEP 2: CREATE DEFAULT USERS
-- Password: Password123
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO "user" (username, password_hash, email, full_name, status, created_at, department_id) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@smd.edu.vn', 'System Administrator', 'ACTIVE', CURRENT_TIMESTAMP, NULL),
('lecturer', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'lecturer@smd.edu.vn', 'Lecturer User', 'ACTIVE', CURRENT_TIMESTAMP, NULL),
('head_dept', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'head.dept@smd.edu.vn', 'Head of Department', 'ACTIVE', CURRENT_TIMESTAMP, NULL),
('academic', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'academic@smd.edu.vn', 'Academic Affairs Officer', 'ACTIVE', CURRENT_TIMESTAMP, NULL),
('principal', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'principal@smd.edu.vn', 'Principal User', 'ACTIVE', CURRENT_TIMESTAMP, NULL),
('student', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student@smd.edu.vn', 'Student User', 'ACTIVE', CURRENT_TIMESTAMP, NULL)
ON CONFLICT (username) DO NOTHING;

-- STEP 3: ASSIGN ROLES
INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id FROM "user" u, role r WHERE u.username = 'admin' AND r.role_name = 'ADMIN'
UNION ALL
SELECT u.user_id, r.role_id FROM "user" u, role r WHERE u.username = 'lecturer' AND r.role_name = 'LECTURER'
UNION ALL
SELECT u.user_id, r.role_id FROM "user" u, role r WHERE u.username = 'head_dept' AND r.role_name = 'HEAD_OF_DEPARTMENT'
UNION ALL
SELECT u.user_id, r.role_id FROM "user" u, role r WHERE u.username = 'academic' AND r.role_name = 'ACADEMIC_AFFAIRS'
UNION ALL
SELECT u.user_id, r.role_id FROM "user" u, role r WHERE u.username = 'principal' AND r.role_name = 'PRINCIPAL'
UNION ALL
SELECT u.user_id, r.role_id FROM "user" u, role r WHERE u.username = 'student' AND r.role_name = 'STUDENT'
ON CONFLICT DO NOTHING;

-- STEP 4: VERIFY
SELECT 
    u.user_id,
    u.username, 
    u.email, 
    u.full_name,
    u.status,
    u.created_at,
    r.role_name 
FROM "user" u 
JOIN user_role ur ON u.user_id = ur.user_id 
JOIN role r ON ur.role_id = r.role_id 
ORDER BY u.username;

-- =====================================================
-- DEFAULT LOGIN CREDENTIALS:
-- =====================================================
-- All accounts use password: Password123
-- 
-- Username: admin       | Role: ADMIN
-- Username: lecturer    | Role: LECTURER  
-- Username: head_dept   | Role: HEAD_OF_DEPARTMENT
-- Username: academic    | Role: ACADEMIC_AFFAIRS
-- Username: principal   | Role: PRINCIPAL
-- Username: student     | Role: STUDENT
-- 
-- ⚠️ IMPORTANT: Change passwords after first login!
-- =====================================================