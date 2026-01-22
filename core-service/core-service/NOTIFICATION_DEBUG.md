# Notification System Troubleshooting Guide

## Problem: Notifications not being created when syllabus status changes

### Quick Diagnostic Steps

#### 1. Run Diagnostic Script

```powershell
cd core-service
.\check-notification.ps1
```

This will check:

- ✅ Notifications table exists
- ✅ Table structure is correct
- ✅ Departments have HOD assigned
- ✅ head_of_department_id column exists

#### 2. Check Database Setup

**Connect to database:**

```powershell
psql -U postgres -d smd_db
```

**Check if notifications table exists:**

```sql
\dt notifications
```

**If table doesn't exist, run migration:**

```powershell
psql -U postgres -d smd_db -f init\init-notification.sql
```

#### 3. Check Head of Department Assignment

**See current HOD assignments:**

```sql
SELECT
    d.department_id,
    d.dept_name,
    d.head_of_department_id,
    u.username as hod_username
FROM department d
LEFT JOIN "user" u ON d.head_of_department_id = u.user_id;
```

**If HODs are missing, run setup script:**

```powershell
psql -U postgres -d smd_db -f setup-hod.sql
```

**Or assign manually:**

```sql
UPDATE department
SET head_of_department_id = (
    SELECT user_id FROM "user" WHERE username = 'head_dept'
)
WHERE dept_name = 'Computer Science';
```

#### 4. Check Application Logs

After submitting a syllabus, check logs for:

**✅ Success indicators:**

```
✅ Notification saved successfully! Notification ID: 1, sent to HOD head_dept for syllabus 5
```

**❌ Error indicators:**

```
❌ No Head of Department assigned for department Computer Science
❌ Department is null for course 1
❌ Error creating notification for syllabus 5
```

#### 5. Test Notification Manually

Use the test endpoint:

```http
POST /api/v1/test/notification/syllabus/{syllabusId}
Authorization: Bearer <your-token>
```

This will show detailed debug info:

```json
{
  "syllabusId": 5,
  "courseName": "Introduction to Programming",
  "courseCode": "CS101",
  "departmentName": "Computer Science",
  "hodAssigned": true,
  "hodUsername": "head_dept",
  "notificationSent": true,
  "message": "Notification created successfully. Check logs for details."
}
```

#### 6. Verify Notification was Created

```sql
SELECT
    n.notification_id,
    n.type,
    n.title,
    u.username as recipient,
    s.syllabus_id,
    c.course_code,
    n.created_at
FROM notifications n
JOIN "user" u ON n.user_id = u.user_id
LEFT JOIN syllabuses s ON n.syllabus_id = s.syllabus_id
LEFT JOIN course c ON s.course_id = c.course_id
ORDER BY n.created_at DESC
LIMIT 10;
```

### Common Issues and Solutions

#### Issue 1: "No Head of Department assigned"

**Cause:** Department doesn't have a HOD user assigned

**Solution:**

```sql
-- Find HOD users
SELECT u.user_id, u.username, u.full_name, d.dept_name
FROM "user" u
JOIN user_role ur ON u.user_id = ur.user_id
JOIN role r ON ur.role_id = r.role_id
LEFT JOIN department d ON u.department_id = d.department_id
WHERE r.role_name = 'HEAD_OF_DEPARTMENT';

-- Assign HOD to department
UPDATE department
SET head_of_department_id = <user_id>
WHERE department_id = <dept_id>;
```

#### Issue 2: "Notifications table does not exist"

**Solution:**

```powershell
psql -U postgres -d smd_db -f init\init-notification.sql
```

#### Issue 3: "head_of_department_id column missing"

**Solution:**

```powershell
psql -U postgres -d smd_db -f init\migration-add-hod-to-department.sql
```

#### Issue 4: Notifications created but not showing in API

**Check:**

1. User authentication - are you logged in as the correct user?
2. Query the database directly to verify notifications exist
3. Check API endpoint: `GET /api/v1/notifications/unread`

### Testing Workflow

1. **Setup test data:**

```sql
-- Ensure test user has HEAD_OF_DEPARTMENT role
INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM "user" u, role r
WHERE u.username = 'head_dept' AND r.role_name = 'HEAD_OF_DEPARTMENT'
ON CONFLICT DO NOTHING;

-- Assign HOD to department
UPDATE department SET head_of_department_id = (
    SELECT user_id FROM "user" WHERE username = 'head_dept'
) WHERE dept_name = 'Computer Science';
```

2. **Submit syllabus:**

```http
POST /api/v1/syllabuses/5/submit
Authorization: Bearer <lecturer-token>
Content-Type: application/json

{
  "comment": "Ready for review"
}
```

3. **Check notification as HOD:**

```http
GET /api/v1/notifications/unread
Authorization: Bearer <hod-token>
```

4. **Verify in database:**

```sql
SELECT * FROM notifications WHERE type = 'SYLLABUS_SUBMITTED' ORDER BY created_at DESC LIMIT 1;
```

### Debug Checklist

- [ ] Notifications table exists in database
- [ ] head_of_department_id column exists in department table
- [ ] Department has HOD assigned (head_of_department_id is NOT NULL)
- [ ] HOD user exists and has HEAD_OF_DEPARTMENT role
- [ ] Application logs show notification creation attempt
- [ ] No exceptions in application logs
- [ ] Notification appears in database after syllabus submit
- [ ] API returns notification for HOD user

### Contact

If issue persists after following this guide, provide:

1. Application logs around the time of syllabus submission
2. Output of diagnostic script
3. Database query results for HOD assignment
4. API response from test endpoint
