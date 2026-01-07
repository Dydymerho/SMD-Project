-- Migration script to add versioning fields to existing syllabuses
-- This should be run ONCE to update existing data after adding versioning columns

-- Step 1: Update all existing syllabuses to have default values for new versioning columns
UPDATE syllabus 
SET 
    is_latest_version = true,
    updated_at = created_at
WHERE 
    is_latest_version IS NULL;

-- Step 2: For each course + academic_year combination with multiple syllabuses,
-- mark only the one with the highest syllabus_id as latest
-- (assuming newest records have higher IDs)

WITH latest_per_course AS (
    SELECT 
        course_id,
        academic_year,
        MAX(syllabus_id) as latest_id
    FROM syllabus
    GROUP BY course_id, academic_year
    HAVING COUNT(*) > 1  -- Only for courses with multiple versions
)
UPDATE syllabus s
SET is_latest_version = false
FROM latest_per_course lpc
WHERE 
    s.course_id = lpc.course_id 
    AND s.academic_year = lpc.academic_year
    AND s.syllabus_id != lpc.latest_id;

-- Step 3: Verify the migration
SELECT 
    course_id,
    academic_year,
    version_no,
    syllabus_id,
    is_latest_version,
    created_at,
    updated_at
FROM syllabus
ORDER BY course_id, academic_year, version_no DESC;

-- Expected result: 
-- - All syllabuses should have is_latest_version set
-- - For each course + academic_year, only one syllabus should have is_latest_version = true
-- - That should be the one with the highest syllabus_id (most recent)
