-- =====================================================
-- Script to initialize roles and assign roles to users
-- Run after user registration
-- =====================================================

-- 1. CREATE DEFAULT ROLES
INSERT INTO role (role_name) VALUES ('ADMIN') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO role (role_name) VALUES ('LECTURER') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO role (role_name) VALUES ('HEAD_OF_DEPARTMENT') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO role (role_name) VALUES ('ACADEMIC_AFFAIRS') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO role (role_name) VALUES ('STUDENT') ON CONFLICT (role_name) DO NOTHING;

-- 2. EXAMPLE: Assign roles to users
-- Replace user_id with actual user IDs from your database

-- Example: Assign ADMIN role to user with username 'admin'
-- First, find the user_id and role_id
-- INSERT INTO user_role (user_id, role_id)
-- SELECT u.user_id, r.role_id
-- FROM "user" u, role r
-- WHERE u.username = 'admin' AND r.role_name = 'ADMIN'
-- ON CONFLICT DO NOTHING;

-- Example: Assign LECTURER role to user with username 'lecturer1'
-- INSERT INTO user_role (user_id, role_id)
-- SELECT u.user_id, r.role_id
-- FROM "user" u, role r
-- WHERE u.username = 'lecturer1' AND r.role_name = 'LECTURER'
-- ON CONFLICT DO NOTHING;

-- Example: Assign HEAD_OF_DEPARTMENT role to user with username 'dept_head1'
-- INSERT INTO user_role (user_id, role_id)
-- SELECT u.user_id, r.role_id
-- FROM "user" u, role r
-- WHERE u.username = 'dept_head1' AND r.role_name = 'HEAD_OF_DEPARTMENT'
-- ON CONFLICT DO NOTHING;

-- Example: Assign ACADEMIC_AFFAIRS role to user with username 'academic1'
-- INSERT INTO user_role (user_id, role_id)
-- SELECT u.user_id, r.role_id
-- FROM "user" u, role r
-- WHERE u.username = 'academic1' AND r.role_name = 'ACADEMIC_AFFAIRS'
-- ON CONFLICT DO NOTHING;

-- Example: Assign STUDENT role to user with username 'student1'
-- INSERT INTO user_role (user_id, role_id)
-- SELECT u.user_id, r.role_id
-- FROM "user" u, role r
-- WHERE u.username = 'student1' AND r.role_name = 'STUDENT'
-- ON CONFLICT DO NOTHING;

-- 3. VERIFY ROLES
SELECT * FROM role;

-- 4. VERIFY USER ROLES
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    r.role_name
FROM "user" u
LEFT JOIN user_role ur ON u.user_id = ur.user_id
LEFT JOIN role r ON ur.role_id = r.role_id
ORDER BY u.username;

-- =====================================================
-- USAGE EXAMPLES:
-- =====================================================

-- To assign ADMIN role to a specific user by username:
-- INSERT INTO user_role (user_id, role_id)
-- SELECT u.user_id, r.role_id
-- FROM "user" u, role r
-- WHERE u.username = 'your_username_here' AND r.role_name = 'ADMIN';

-- To assign multiple roles to one user:
-- INSERT INTO user_role (user_id, role_id)
-- SELECT u.user_id, r.role_id
-- FROM "user" u, role r
-- WHERE u.username = 'your_username_here' AND r.role_name IN ('ADMIN', 'LECTURER');

-- To remove a role from a user:
-- DELETE FROM user_role
-- WHERE user_id = (SELECT user_id FROM "user" WHERE username = 'your_username_here')
--   AND role_id = (SELECT role_id FROM role WHERE role_name = 'ADMIN');
