-- Migration script to add head_of_department_id to department table
-- Run this after initial database setup

-- Step 1: Add the head_of_department_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'department' 
        AND column_name = 'head_of_department_id'
    ) THEN
        ALTER TABLE department 
        ADD COLUMN head_of_department_id BIGINT;
        
        -- Add foreign key constraint
        ALTER TABLE department
        ADD CONSTRAINT fk_department_head_of_department
        FOREIGN KEY (head_of_department_id) 
        REFERENCES "user"(user_id)
        ON DELETE SET NULL;
        
        -- Add index for better query performance
        CREATE INDEX idx_department_head_of_department 
        ON department(head_of_department_id);
        
        RAISE NOTICE 'Column head_of_department_id added to department table';
    ELSE
        RAISE NOTICE 'Column head_of_department_id already exists';
    END IF;
END $$;

-- Step 2: Optional - Set default HOD for existing departments
-- Update this based on your actual data
-- Example: Set user with username 'head_dept' as HOD for Computer Science department
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

-- Verify the changes
SELECT 
    d.department_id,
    d.dept_name,
    u.username as head_of_department_username,
    u.full_name as head_of_department_name
FROM department d
LEFT JOIN "user" u ON d.head_of_department_id = u.user_id
ORDER BY d.department_id;

COMMENT ON COLUMN department.head_of_department_id IS 'Reference to the user who is the head of this department';
