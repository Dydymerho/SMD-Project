# Syllabus Versioning System

## Overview

This document describes the versioning system implemented for syllabuses, allowing multiple versions of a syllabus for the same course and academic year with automatic version number management.

## Features

### 1. **Auto-Version Number Determination**

- Version numbers are automatically determined when creating a new syllabus
- If version number is not provided, system queries for max version and increments by 1
- First version of a course/year starts at version 1

### 2. **Latest Version Tracking**

- Each syllabus has an `is_latest_version` flag
- When a new version is created, all old versions are automatically marked as not latest
- Only one version can be marked as latest for a given course + academic year

### 3. **Version History & Audit Trail**

- `created_at`: Timestamp when syllabus was first created (immutable)
- `updated_at`: Timestamp of last modification (auto-updated via @PreUpdate)
- `published_at`: Timestamp when syllabus was published
- `archived_at`: Timestamp when syllabus was archived
- `previous_version_id`: Reference to the syllabus this was created from
- `version_notes`: Description of changes made in this version

### 4. **Content Copying Between Versions**

- When creating a new version from an existing syllabus, optionally copy:
  - Materials
  - Session Plans
  - Assessments
  - CLOs (Course Learning Outcomes)

## Database Schema

### Syllabus Entity Fields Added:

```java
@Column(name = "updated_at")
private LocalDateTime updatedAt;

@Column(name = "published_at")
private LocalDateTime publishedAt;

@Column(name = "archived_at")
private LocalDateTime archivedAt;

@Column(name = "is_latest_version", nullable = false)
private Boolean isLatestVersion;

@Column(name = "previous_version_id")
private Long previousVersionId;

@Column(name = "version_notes", length = 1000)
private String versionNotes;
```

### Unique Constraint:

```sql
UNIQUE (course_id, academic_year, version_no)
```

## API Endpoints

### 1. Create Syllabus with Auto-Versioning

**POST** `/api/v1/syllabuses/create-with-dto`

**Request Body:**

```json
{
  "courseId": 1,
  "lecturerId": 2,
  "academicYear": "2024-2025",
  "programId": 3,
  "versionNotes": "Initial version for 2024-2025",
  "copyFromVersionId": null
}
```

**Response:**

```json
{
  "syllabusId": 10,
  "courseId": 1,
  "courseName": "Data Structures",
  "courseCode": "CS201",
  "lecturerId": 2,
  "lecturerName": "Dr. Nguyen Van A",
  "academicYear": "2024-2025",
  "versionNo": 1,
  "currentStatus": "DRAFT",
  "isLatestVersion": true,
  "versionNotes": "Initial version for 2024-2025",
  "createdAt": "2024-01-05T10:00:00",
  "updatedAt": "2024-01-05T10:00:00"
}
```

### 2. Create New Version from Existing Syllabus

**POST** `/api/v1/syllabuses/create-version`

**Request Body:**

```json
{
  "sourceSyllabusId": 10,
  "versionNotes": "Updated assessment criteria and added new CLOs",
  "copyMaterials": true,
  "copySessionPlans": true,
  "copyAssessments": false,
  "copyCLOs": true
}
```

**Response:**

```json
{
  "syllabusId": 11,
  "courseId": 1,
  "courseName": "Data Structures",
  "courseCode": "CS201",
  "lecturerId": 2,
  "lecturerName": "Dr. Nguyen Van A",
  "academicYear": "2024-2025",
  "versionNo": 2,
  "currentStatus": "DRAFT",
  "isLatestVersion": true,
  "previousVersionId": 10,
  "versionNotes": "Updated assessment criteria and added new CLOs",
  "createdAt": "2024-02-15T14:30:00",
  "updatedAt": "2024-02-15T14:30:00"
}
```

### 3. Get All Versions of a Syllabus

**GET** `/api/v1/syllabuses/course/{courseId}/versions?academicYear=2024-2025`

**Response:**

```json
[
  {
    "syllabusId": 11,
    "versionNo": 2,
    "currentStatus": "PUBLISHED",
    "createdAt": "2024-02-15T14:30:00",
    "updatedAt": "2024-02-20T09:15:00",
    "publishedAt": "2024-02-20T09:15:00",
    "isLatestVersion": true,
    "versionNotes": "Updated assessment criteria and added new CLOs",
    "lecturerName": "Dr. Nguyen Van A",
    "hasPdf": true
  },
  {
    "syllabusId": 10,
    "versionNo": 1,
    "currentStatus": "ARCHIVED",
    "createdAt": "2024-01-05T10:00:00",
    "updatedAt": "2024-02-15T14:30:00",
    "archivedAt": "2024-02-15T14:30:00",
    "isLatestVersion": false,
    "versionNotes": "Initial version for 2024-2025",
    "lecturerName": "Dr. Nguyen Van A",
    "hasPdf": false
  }
]
```

### 4. Get Latest Version

**GET** `/api/v1/syllabuses/course/{courseId}/latest?academicYear=2024-2025`

**Response:**

```json
{
  "syllabusId": 11,
  "courseId": 1,
  "courseName": "Data Structures",
  "courseCode": "CS201",
  "versionNo": 2,
  "currentStatus": "PUBLISHED",
  "isLatestVersion": true,
  "createdAt": "2024-02-15T14:30:00",
  "updatedAt": "2024-02-20T09:15:00",
  "publishedAt": "2024-02-20T09:15:00"
}
```

## Service Layer Methods

### Auto-Versioning Methods:

#### `determineNextVersionNumber(Long courseId, String academicYear)`

- Queries database for max version number for given course + academic year
- Returns max + 1, or 1 if no versions exist

#### `updateOldVersionsAsNotLatest(Long courseId, String academicYear)`

- Finds all syllabuses for given course + academic year where `is_latest_version = true`
- Sets their `is_latest_version` to `false`

#### `createNewVersion(Long sourceSyllabusId, String versionNotes, ...)`

- Creates a new syllabus entity copied from source
- Auto-determines next version number
- Marks old versions as not latest
- Optionally copies related content (materials, sessions, assessments, CLOs)
- Returns newly created syllabus

### Query Methods:

#### `getAllVersions(Long courseId, String academicYear)`

- Returns all versions ordered by version number descending

#### `getLatestVersion(Long courseId, String academicYear)`

- Returns the syllabus marked as latest version
- Throws ResourceNotFoundException if not found

## Workflow Example

### Scenario: Creating Syllabus Versions Across Academic Years

**1. Create initial syllabus for 2024-2025:**

```
POST /api/v1/syllabuses
{
  "courseId": 1,
  "academicYear": "2024-2025",
  ...
}
→ Auto-assigned version: 1, is_latest: true
```

**2. Create revision in same year:**

```
POST /api/v1/syllabuses/create-version
{
  "sourceSyllabusId": 10,
  "versionNotes": "Added new assessment"
}
→ Auto-assigned version: 2, is_latest: true
→ Old version 1: is_latest → false
```

**3. Create syllabus for next year (2025-2026):**

```
POST /api/v1/syllabuses
{
  "courseId": 1,
  "academicYear": "2025-2026",
  ...
}
→ Auto-assigned version: 1, is_latest: true
→ Previous year's versions unchanged
```

**4. Get all versions for 2024-2025:**

```
GET /api/v1/syllabuses/course/1/versions?academicYear=2024-2025
→ Returns: [v2 (latest), v1 (archived)]
```

**5. Get latest for 2025-2026:**

```
GET /api/v1/syllabuses/course/1/latest?academicYear=2025-2026
→ Returns: v1 (latest)
```

## Best Practices

1. **Always use auto-versioning**: Let the system determine version numbers to avoid conflicts

2. **Document changes**: Always provide meaningful `versionNotes` when creating new versions

3. **Archive old versions**: When a new version becomes the "official" one, consider archiving old versions

4. **Use latest version queries**: For student-facing applications, always fetch the latest version

5. **Preserve history**: Never delete old versions - they serve as audit trail

6. **Copy content selectively**: When creating new versions, only copy content that hasn't changed significantly

## Testing

### Test the versioning flow:

1. Create a syllabus (version should be 1)
2. Create another syllabus for the same course+year (version should be 2)
3. Check that version 1 is marked as `is_latest: false`
4. Query for all versions - should return both ordered by version desc
5. Query for latest - should return version 2
6. Create syllabus for different academic year - should start at version 1 again

## Future Enhancements

1. **Version Comparison**: Add endpoint to compare two versions side-by-side
2. **Version Restore**: Allow restoring an old version as the latest
3. **Change Tracking**: Detailed diff between versions
4. **Approval Workflow**: Require approval before marking version as latest
5. **Auto-archiving**: Automatically archive old versions when new one is published
6. **Version Branching**: Allow creating branches from specific versions

## Related Documentation

- See [API_ENDPOINTS.md](../../docs/API_ENDPOINTS.md) for complete API documentation
- See [ROLE_MANAGEMENT.md](ROLE_MANAGEMENT.md) for permission system
- See Syllabus entity for full schema details
