-- Quick setup script for notification system
-- Run this to ensure departments have Head of Department assigned

-- Step 1: Check current status
SELECT 
    d.department_id,
    d.dept_name,
    d.head_of_department_id,
    u.username as hod_username
FROM department d
LEFT JOIN "user" u ON d.head_of_department_id = u.user_id;

-- Step 2: Find users with HEAD_OF_DEPARTMENT role
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    u.department_id,
    d.dept_name,
    r.role_name
FROM "user" u
JOIN user_role ur ON u.user_id = ur.user_id
JOIN role r ON ur.role_id = r.role_id
LEFT JOIN department d ON u.department_id = d.department_id
WHERE r.role_name = 'HEAD_OF_DEPARTMENT';

-- Step 3: Auto-assign HOD to their department if not already assigned
UPDATE department d
SET head_of_department_id = (
    SELECT u.user_id 
    FROM "user" u 
    JOIN user_role ur ON u.user_id = ur.user_id
    JOIN role r ON ur.role_id = r.role_id
    WHERE r.role_name = 'HEAD_OF_DEPARTMENT'
    AND u.department_id = d.department_id
    LIMIT 1
)
WHERE d.head_of_department_id IS NULL
AND EXISTS (
    SELECT 1 
    FROM "user" u 
    JOIN user_role ur ON u.user_id = ur.user_id
    JOIN role r ON ur.role_id = r.role_id
    WHERE r.role_name = 'HEAD_OF_DEPARTMENT'
    AND u.department_id = d.department_id
);

-- Step 4: Verify the assignment
SELECT 
    d.department_id,
    d.dept_name,
    d.head_of_department_id,
    u.username as hod_username,
    u.full_name as hod_name
FROM department d
LEFT JOIN "user" u ON d.head_of_department_id = u.user_id
ORDER BY d.department_id;

-- Step 5: If no HOD exists for a department, use the default 'head_dept' user as fallback
-- (Only for testing purposes - in production, create proper HOD users)
UPDATE department d
SET head_of_department_id = (
    SELECT u.user_id 
    FROM "user" u 
    WHERE u.username = 'head_dept'
    LIMIT 1
)
WHERE d.head_of_department_id IS NULL
AND EXISTS (SELECT 1 FROM "user" WHERE username = 'head_dept');

-- Final verification
SELECT 
    d.department_id,
    d.dept_name,
    CASE 
        WHEN d.head_of_department_id IS NULL THEN '❌ No HOD'
        ELSE '✅ HOD Assigned'
    END as status,
    u.username as hod_username
FROM department d
LEFT JOIN "user" u ON d.head_of_department_id = u.user_id
ORDER BY d.department_id;
