# Course Relationship Tree - Sample Data Visualization

## Overview

The DatabaseSeeder creates a comprehensive CS curriculum with 21 IT courses organized in a 4-year program with clear prerequisite chains, corequisites, and equivalents.

## Course Dependency Tree

```
                                    [CAP490]
                                  Capstone Project
                                        |
                        +---------------+---------------+
                        |                               |
                   [SWD392]                          [ML402]
              Software Design                  Machine Learning
                        |                               |
        +---------------+---------------+          [AI401]
        |               |               |     Artificial Intelligence
    [PRO192]       [CSD201]        [SWR302]          |
       OOP      Data Structures   Requirements   [ALG301]
        |               |               |       Advanced Algorithms
        |               |           [DBI202]          |
        |               |          Database      [CSD201]
    [PRF192]            |               |             |
  Programming       [MAT101]        [PRF192]     [MAT101]
  Fundamentals   Discrete Math
```

## Detailed Course Relationships by Year

### Year 1 - Foundation Layer

These courses form the base of the curriculum with no prerequisites:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MAT101     │  │   PRF192     │  │   COM101     │
│ Discrete Math│  │Programming   │  │Intro to CS   │
│  3 credits   │  │Fundamentals  │  │  3 credits   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       ▼                 ▼                  ▼
    Prerequisites for Year 2 courses
```

### Year 2 - Core Layer

```
Year 1 Prerequisites:
  PRF192 → ┌──────────────┐
           │   PRO192     │
           │     OOP      │ ←→ Corequisite ←→ CSD201
           │  3 credits   │
           └──────────────┘

  PRF192 + MAT101 → ┌──────────────┐
                    │   CSD201     │
                    │Data Structures│
                    │  3 credits   │
                    └──────────────┘

  PRF192 → ┌──────────────┐
           │   DBI202     │
           │  Database    │ ←→ Corequisite ←→ WED201c
           │  3 credits   │
           └──────────────┘

  COM101 → ┌──────────────┐
           │   OSG202     │
           │Operating Sys │ ←→ Corequisite ←→ NWC203
           │  3 credits   │
           └──────────────┘

           ┌──────────────┐
           │   NWC203     │
           │  Networks    │
           │  3 credits   │
           └──────────────┘
```

### Year 3 - Advanced Layer

```
PRO192 → ┌──────────────┐
         │   JPD113     │
         │Java Program  │ ≡ Equivalent ≡ WED201c
         │  3 credits   │
         └──────────────┘

PRO192 + DBI202 → ┌──────────────┐
                  │   WED201c    │
                  │Web Dev       │
                  │  3 credits   │
                  └──────────────┘

DBI202 → ┌──────────────┐
         │   SWR302     │
         │Requirements  │ ←→ Corequisite ←→ SWT301
         │  3 credits   │
         └──────────────┘

SWR302 → ┌──────────────┐
         │   SWT301     │
         │  Testing     │
         │  3 credits   │
         └──────────────┘

PRO192 + CSD201 → ┌──────────────┐
                  │   SWD392     │
                  │Software      │
                  │Architecture  │
                  │  4 credits   │
                  └──────────────┘

MAT101 + CSD201 → ┌──────────────┐
                  │   ALG301     │
                  │Advanced      │
                  │Algorithms    │
                  │  3 credits   │
                  └──────────────┘
```

### Year 4 - Specialization Layer

```
CSD201 + ALG301 → ┌──────────────┐
                  │   AI401      │
                  │Artificial    │
                  │Intelligence  │
                  │  4 credits   │
                  └──────┬───────┘
                         │
              AI401 + ALG301 → ┌──────────────┐
                               │   ML402      │
                               │Machine       │
                               │Learning      │
                               │  4 credits   │
                               └──────────────┘

OSG202 + NWC203 → ┌──────────────┐
                  │   SEC403     │
                  │Information   │
                  │Security      │
                  │  3 credits   │
                  └──────────────┘

PRO192 + JPD113 → ┌──────────────┐
                  │   MBD404     │
                  │Mobile        │
                  │Development   │
                  │  3 credits   │
                  └──────────────┘

SWD392 → ┌──────────────┐
         │   CAP490     │
         │  Capstone    │
         │   Project    │
         │  4 credits   │
         └──────────────┘
```

## Relationship Statistics

### By Type:

- **Prerequisites (→)**: ~30 relationships
  - Foundation → Core: 5 relationships
  - Core → Advanced: 12 relationships
  - Advanced → Specialization: 8 relationships
- **Corequisites (↔)**: 4 relationships
  - PRO192 ↔ CSD201 (OOP with Data Structures)
  - DBI202 ↔ WED201c (Database with Web Dev)
  - OSG202 ↔ NWC203 (OS with Networks)
  - SWR302 ↔ SWT301 (Requirements with Testing)
- **Equivalents (≡)**: 1 relationship
  - JPD113 ≡ WED201c (Java or Web as advanced OOP)

### By Level:

- **Level 0**: 3 foundation courses (no prerequisites)
- **Level 1**: 5 core courses (1-2 prerequisites)
- **Level 2**: 6 advanced courses (2-3 prerequisites)
- **Level 3**: 5 specialization courses (3+ prerequisites)

## Sample API Queries

### 1. Get Course Tree for AI

```http
GET /api/v1/course-relations/tree/{AI401_id}

Expected depth: 4 levels
- AI401 (Level 0)
  - ALG301 (Level 1)
    - CSD201 (Level 2)
      - PRF192 (Level 3)
      - MAT101 (Level 3)
  - CSD201 (Level 1)
    - PRF192 (Level 2)
    - MAT101 (Level 2)
```

### 2. Get All Relationships for SWD392

```http
GET /api/v1/course-relations/course/{SWD392_id}

Expected result:
- Prerequisites: PRO192, CSD201
- Corequisites: (none)
- Required by: CAP490
```

### 3. Check Circular Dependency

```http
GET /api/v1/course-relations/check-circular?courseId={PRF192}&relatedCourseId={CAP490}

Expected: true (would create circular dependency)
Reason: PRF192 → PRO192 → SWD392 → CAP490 → PRF192 (circle)
```

## Learning Paths

### Path 1: Backend Developer

```
Semester 1: MAT101, PRF192, COM101
Semester 2: PRO192, CSD201, DBI202
Semester 3: JPD113, SWR302, SWT301
Semester 4: SWD392, ALG301
Semester 5: SEC403, CAP490
```

### Path 2: AI/ML Specialist

```
Semester 1: MAT101, PRF192, COM101
Semester 2: PRO192, CSD201
Semester 3: ALG301, SWD392
Semester 4: AI401
Semester 5: ML402, CAP490
```

### Path 3: Full-Stack Developer

```
Semester 1: MAT101, PRF192, COM101
Semester 2: PRO192, DBI202
Semester 3: WED201c, JPD113, SWR302
Semester 4: MBD404, SWD392
Semester 5: CAP490
```

## Validation Rules Applied

1. ✅ No self-references
2. ✅ No circular dependencies
3. ✅ All prerequisites exist before dependent courses
4. ✅ Corequisites are bidirectional or complementary
5. ✅ Equivalents provide alternative paths

## Database Schema

The relationships are stored in the `course_relation` table:

```sql
course_relation_id | course_id | related_course_id | relation_type
-------------------|-----------|-------------------|---------------
1                  | PRO192    | PRF192           | PREREQUISITE
2                  | CSD201    | PRF192           | PREREQUISITE
3                  | CSD201    | MAT101           | PREREQUISITE
4                  | CSD201    | PRO192           | COREQUISITE
...
```

## Testing the Seeded Data

After running the application, you can verify the data:

```bash
# Check total courses
SELECT COUNT(*) FROM course WHERE department_id = (SELECT department_id FROM department WHERE department_name LIKE '%Cong Nghe%');

# Check total relationships
SELECT COUNT(*) FROM course_relation;

# View prerequisite chain for CAP490
WITH RECURSIVE prereq_tree AS (
    SELECT course_id, related_course_id, relation_type, 1 as level
    FROM course_relation
    WHERE course_id = (SELECT course_id FROM course WHERE course_code = 'CAP490')

    UNION ALL

    SELECT cr.course_id, cr.related_course_id, cr.relation_type, pt.level + 1
    FROM course_relation cr
    INNER JOIN prereq_tree pt ON cr.course_id = pt.related_course_id
    WHERE pt.level < 5
)
SELECT * FROM prereq_tree;
```

## Notes

- All IT courses are in the "Khoa Cong Nghe Thong Tin" department
- The tree supports multiple paths to the same course (e.g., CSD201 can be reached via different prerequisites)
- Corequisites help students plan their semester schedules
- The Capstone project (CAP490) serves as the culmination requiring SWD392
