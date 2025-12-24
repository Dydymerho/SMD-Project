# SMD Core Service - API Endpoints Documentation

## Base URL

```
http://localhost:8080
```

## Table of Contents

- [Authentication APIs](#authentication-apis)
- [Department APIs](#department-apis)
- [Program APIs](#program-apis)
- [Course APIs](#course-apis)
- [Syllabus APIs](#syllabus-apis)
- [CLO (Course Learning Outcomes) APIs](#clo-apis)
- [PLO (Program Learning Outcomes) APIs](#plo-apis)
- [Assessment APIs](#assessment-apis)
- [Material APIs](#material-apis)
- [Session Plan APIs](#session-plan-apis)

---

## Authentication APIs

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string"
}
```

**Response:** `200 OK`

```json
{
  "message": "User registered successfully"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`

```json
{
  "token": "jwt_token_string",
  "type": "Bearer",
  "username": "string",
  "email": "string",
  "roles": ["ROLE_USER"]
}
```

---

## Department APIs

### Get All Departments

```http
GET /api/departments
```

**Response:** `200 OK`

```json
[
  {
    "departmentId": 1,
    "deptName": "Computer Science"
  }
]
```

### Get Department by ID

```http
GET /api/departments/{id}
```

**Response:** `200 OK`

```json
{
  "departmentId": 1,
  "deptName": "Computer Science"
}
```

### Create Department

```http
POST /api/departments
Content-Type: application/json

{
  "deptName": "Computer Science"
}
```

**Response:** `201 CREATED`

```json
{
  "departmentId": 1,
  "deptName": "Computer Science"
}
```

### Update Department

```http
PUT /api/departments/{id}
Content-Type: application/json

{
  "deptName": "Information Technology"
}
```

**Response:** `200 OK`

```json
{
  "departmentId": 1,
  "deptName": "Information Technology"
}
```

### Delete Department

```http
DELETE /api/departments/{id}
```

**Response:** `204 NO CONTENT`

---

## Program APIs

### Get All Programs

```http
GET /api/programs
```

**Response:** `200 OK`

```json
[
  {
    "programId": 1,
    "programName": "Software Engineering",
    "department": {
      "departmentId": 1,
      "deptName": "Computer Science"
    }
  }
]
```

### Get Program by ID

```http
GET /api/programs/{id}
```

**Response:** `200 OK`

```json
{
  "programId": 1,
  "programName": "Software Engineering",
  "department": {
    "departmentId": 1,
    "deptName": "Computer Science"
  }
}
```

### Get Programs by Department

```http
GET /api/programs/department/{departmentId}
```

**Response:** `200 OK`

```json
[
  {
    "programId": 1,
    "programName": "Software Engineering",
    "department": {
      "departmentId": 1,
      "deptName": "Computer Science"
    }
  }
]
```

### Create Program

```http
POST /api/programs
Content-Type: application/json

{
  "programName": "Software Engineering",
  "department": {
    "departmentId": 1
  }
}
```

**Response:** `201 CREATED`

### Update Program

```http
PUT /api/programs/{id}
Content-Type: application/json

{
  "programName": "Software Engineering",
  "department": {
    "departmentId": 1
  }
}
```

**Response:** `200 OK`

### Delete Program

```http
DELETE /api/programs/{id}
```

**Response:** `204 NO CONTENT`

---

## Course APIs

### Get All Courses

```http
GET /api/courses
```

**Response:** `200 OK`

```json
[
  {
    "courseId": 1,
    "courseCode": "CS101",
    "courseName": "Introduction to Programming",
    "credits": 3,
    "department": {
      "departmentId": 1,
      "deptName": "Computer Science"
    }
  }
]
```

### Get Course by ID

```http
GET /api/courses/{id}
```

**Response:** `200 OK`

```json
{
  "courseId": 1,
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "credits": 3,
  "department": {
    "departmentId": 1,
    "deptName": "Computer Science"
  }
}
```

### Get Course by Course Code

```http
GET /api/courses/code/{courseCode}
```

**Response:** `200 OK`

```json
{
  "courseId": 1,
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "credits": 3,
  "department": {
    "departmentId": 1,
    "deptName": "Computer Science"
  }
}
```

### Create Course

```http
POST /api/courses
Content-Type: application/json

{
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "credits": 3,
  "department": {
    "departmentId": 1
  }
}
```

**Response:** `201 CREATED`

### Update Course

```http
PUT /api/courses/{id}
Content-Type: application/json

{
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "credits": 3,
  "department": {
    "departmentId": 1
  }
}
```

**Response:** `200 OK`

### Delete Course

```http
DELETE /api/courses/{id}
```

**Response:** `204 NO CONTENT`

---

## Syllabus APIs

### Get All Syllabi

```http
GET /api/syllabuses
```

**Response:** `200 OK`

### Get Syllabus by ID

```http
GET /api/syllabuses/{id}
```

**Response:** `200 OK`

### Search Syllabi

```http
GET /api/syllabuses/search?keyword={keyword}
```

**Response:** `200 OK`

### Create Syllabus

```http
POST /api/syllabuses
Content-Type: application/json

{
  "course": {
    "courseId": 1
  },
  "program": {
    "programId": 1
  },
  "status": "DRAFT",
  "academicYear": "2024-2025",
  "courseObjectives": "string",
  "courseDescription": "string"
}
```

**Response:** `201 CREATED`

### Update Syllabus

```http
PUT /api/syllabuses/{id}
```

**Response:** `200 OK`

### Delete Syllabus

```http
DELETE /api/syllabuses/{id}
```

**Response:** `204 NO CONTENT`

---

## CLO APIs

### Get All CLOs

```http
GET /api/clos
```

**Response:** `200 OK`

```json
[
  {
    "cloId": 1,
    "cloCode": "CLO1",
    "cloDescription": "Understand basic programming concepts",
    "syllabus": {
      "syllabusId": 1
    }
  }
]
```

### Get CLO by ID

```http
GET /api/clos/{id}
```

**Response:** `200 OK`

### Get CLOs by Syllabus

```http
GET /api/clos/syllabus/{syllabusId}
```

**Response:** `200 OK`

```json
[
  {
    "cloId": 1,
    "cloCode": "CLO1",
    "cloDescription": "Understand basic programming concepts",
    "syllabus": {
      "syllabusId": 1
    }
  }
]
```

### Create CLO

```http
POST /api/clos
Content-Type: application/json

{
  "cloCode": "CLO1",
  "cloDescription": "Understand basic programming concepts",
  "syllabus": {
    "syllabusId": 1
  }
}
```

**Response:** `201 CREATED`

### Update CLO

```http
PUT /api/clos/{id}
Content-Type: application/json

{
  "cloCode": "CLO1",
  "cloDescription": "Understand basic programming concepts",
  "syllabus": {
    "syllabusId": 1
  }
}
```

**Response:** `200 OK`

### Delete CLO

```http
DELETE /api/clos/{id}
```

**Response:** `204 NO CONTENT`

---

## PLO APIs

### Get All PLOs

```http
GET /api/plos
```

**Response:** `200 OK`

```json
[
  {
    "ploId": 1,
    "ploCode": "PLO1",
    "ploDescription": "Apply software engineering principles",
    "program": {
      "programId": 1
    }
  }
]
```

### Get PLO by ID

```http
GET /api/plos/{id}
```

**Response:** `200 OK`

### Get PLOs by Program

```http
GET /api/plos/program/{programId}
```

**Response:** `200 OK`

```json
[
  {
    "ploId": 1,
    "ploCode": "PLO1",
    "ploDescription": "Apply software engineering principles",
    "program": {
      "programId": 1
    }
  }
]
```

### Create PLO

```http
POST /api/plos
Content-Type: application/json

{
  "ploCode": "PLO1",
  "ploDescription": "Apply software engineering principles",
  "program": {
    "programId": 1
  }
}
```

**Response:** `201 CREATED`

### Update PLO

```http
PUT /api/plos/{id}
Content-Type: application/json

{
  "ploCode": "PLO1",
  "ploDescription": "Apply software engineering principles",
  "program": {
    "programId": 1
  }
}
```

**Response:** `200 OK`

### Delete PLO

```http
DELETE /api/plos/{id}
```

**Response:** `204 NO CONTENT`

---

## Assessment APIs

### Get All Assessments

```http
GET /api/assessments
```

**Response:** `200 OK`

```json
[
  {
    "assessmentId": 1,
    "name": "Midterm Exam",
    "weightPercent": 30.0,
    "criteria": "Written exam covering topics 1-5",
    "syllabus": {
      "syllabusId": 1
    }
  }
]
```

### Get Assessment by ID

```http
GET /api/assessments/{id}
```

**Response:** `200 OK`

### Get Assessments by Syllabus

```http
GET /api/assessments/syllabus/{syllabusId}
```

**Response:** `200 OK`

```json
[
  {
    "assessmentId": 1,
    "name": "Midterm Exam",
    "weightPercent": 30.0,
    "criteria": "Written exam covering topics 1-5",
    "syllabus": {
      "syllabusId": 1
    }
  }
]
```

### Create Assessment

```http
POST /api/assessments
Content-Type: application/json

{
  "name": "Midterm Exam",
  "weightPercent": 30.0,
  "criteria": "Written exam covering topics 1-5",
  "syllabus": {
    "syllabusId": 1
  }
}
```

**Response:** `201 CREATED`

### Update Assessment

```http
PUT /api/assessments/{id}
Content-Type: application/json

{
  "name": "Midterm Exam",
  "weightPercent": 30.0,
  "criteria": "Written exam covering topics 1-5",
  "syllabus": {
    "syllabusId": 1
  }
}
```

**Response:** `200 OK`

### Delete Assessment

```http
DELETE /api/assessments/{id}
```

**Response:** `204 NO CONTENT`

---

## Material APIs

### Get All Materials

```http
GET /api/materials
```

**Response:** `200 OK`

```json
[
  {
    "materialId": 1,
    "title": "Introduction to Java Programming",
    "author": "John Doe",
    "materialType": "TEXTBOOK",
    "syllabus": {
      "syllabusId": 1
    }
  }
]
```

### Get Material by ID

```http
GET /api/materials/{id}
```

**Response:** `200 OK`

### Get Materials by Syllabus

```http
GET /api/materials/syllabus/{syllabusId}
```

**Response:** `200 OK`

```json
[
  {
    "materialId": 1,
    "title": "Introduction to Java Programming",
    "author": "John Doe",
    "materialType": "TEXTBOOK",
    "syllabus": {
      "syllabusId": 1
    }
  }
]
```

### Create Material

```http
POST /api/materials
Content-Type: application/json

{
  "title": "Introduction to Java Programming",
  "author": "John Doe",
  "materialType": "TEXTBOOK",
  "syllabus": {
    "syllabusId": 1
  }
}
```

**Material Types:**

- `TEXTBOOK`
- `REFERENCE_BOOK`
- `JOURNAL`
- `WEBSITE`
- `VIDEO`
- `OTHER`

**Response:** `201 CREATED`

### Update Material

```http
PUT /api/materials/{id}
Content-Type: application/json

{
  "title": "Introduction to Java Programming",
  "author": "John Doe",
  "materialType": "TEXTBOOK",
  "syllabus": {
    "syllabusId": 1
  }
}
```

**Response:** `200 OK`

### Delete Material

```http
DELETE /api/materials/{id}
```

**Response:** `204 NO CONTENT`

---

## Session Plan APIs

### Get All Session Plans

```http
GET /api/session-plans
```

**Response:** `200 OK`

```json
[
  {
    "sessionId": 1,
    "weekNo": 1,
    "topic": "Introduction to Programming Fundamentals",
    "teachingMethod": "Lecture and Lab",
    "syllabus": {
      "syllabusId": 1
    }
  }
]
```

### Get Session Plan by ID

```http
GET /api/session-plans/{id}
```

**Response:** `200 OK`

### Get Session Plans by Syllabus

```http
GET /api/session-plans/syllabus/{syllabusId}
```

**Response:** `200 OK`

```json
[
  {
    "sessionId": 1,
    "weekNo": 1,
    "topic": "Introduction to Programming Fundamentals",
    "teachingMethod": "Lecture and Lab",
    "syllabus": {
      "syllabusId": 1
    }
  }
]
```

### Create Session Plan

```http
POST /api/session-plans
Content-Type: application/json

{
  "weekNo": 1,
  "topic": "Introduction to Programming Fundamentals",
  "teachingMethod": "Lecture and Lab",
  "syllabus": {
    "syllabusId": 1
  }
}
```

**Response:** `201 CREATED`

### Update Session Plan

```http
PUT /api/session-plans/{id}
Content-Type: application/json

{
  "weekNo": 1,
  "topic": "Introduction to Programming Fundamentals",
  "teachingMethod": "Lecture and Lab",
  "syllabus": {
    "syllabusId": 1
  }
}
```

**Response:** `200 OK`

### Delete Session Plan

```http
DELETE /api/session-plans/{id}
```

**Response:** `204 NO CONTENT`

---

## Error Responses

### 400 Bad Request

```json
{
  "timestamp": "2024-12-23T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid request data"
}
```

### 404 Not Found

```json
{
  "timestamp": "2024-12-23T10:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found with id: 123"
}
```

### 409 Conflict

```json
{
  "timestamp": "2024-12-23T10:00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Resource already exists"
}
```

### 500 Internal Server Error

```json
{
  "timestamp": "2024-12-23T10:00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Notes

1. **Authentication**: Most endpoints (except auth endpoints) require a valid JWT token in the Authorization header:

   ```
   Authorization: Bearer <jwt_token>
   ```

2. **Date Format**: Use ISO 8601 format for dates: `YYYY-MM-DD`

3. **Pagination**: Currently not implemented. All GET endpoints return full lists.

4. **Filtering**: Available through specific endpoints (e.g., by syllabus, by department, by program)

5. **CORS**: Ensure CORS is configured properly in production environments

---

**Last Updated:** December 23, 2025
**Version:** 1.0.0
