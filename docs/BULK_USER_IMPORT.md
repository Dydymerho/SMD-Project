# Bulk User Import Feature

## Overview

The bulk user import feature allows administrators (ADMIN or PRINCIPAL roles) to create multiple user accounts simultaneously by uploading an Excel file (.xlsx format).

## API Endpoints

### GET /api/users/bulk-import/template

**Download Excel Template**

**Authorization Required:** ADMIN or PRINCIPAL role

**Description:** Download a pre-formatted Excel template file with sample data and instructions for bulk user import.

**Response:** Excel file (.xlsx) download

**Example:**

```bash
curl -X GET "http://localhost:8080/api/users/bulk-import/template" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o user_import_template.xlsx
```

**Template Content:**

- **Users Sheet**: Contains header row and sample data (5 sample users)
- **Instructions Sheet**: Detailed instructions, valid role codes, and important notes

---

### POST /api/users/bulk-import

**Upload Users for Bulk Import**

**Authorization Required:** ADMIN or PRINCIPAL role

**Content Type:** multipart/form-data

**Parameters:**

- `file` (required): Excel file (.xlsx) containing user data

**Response:**

```json
{
  "totalRows": 10,
  "successCount": 8,
  "errorCount": 2,
  "message": "Successfully imported 8 users, 2 errors",
  "errors": [
    {
      "rowNumber": 3,
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "roleCode": "INVALID_ROLE",
      "departmentCode": "IT",
      "errorMessage": "Invalid role code: INVALID_ROLE"
    }
  ]
}
```

## Excel File Format

### Required Columns (in order):

| Column # | Column Name     | Description                            | Example                 |
| -------- | --------------- | -------------------------------------- | ----------------------- |
| 1        | Full Name       | User's full name                       | John Doe                |
| 2        | Email           | User's email address (must be unique)  | john.doe@university.edu |
| 3        | Role Code       | Role identifier (must exist in system) | LECTURER                |
| 4        | Department Code | Department name (must exist in system) | Computer Science        |

### Sample Excel Template

**Recommended:** Download the official template using the `/api/users/bulk-import/template` endpoint for the most accurate format.

```
| Full Name       | Email                      | Role Code           | Department Code    |
|-----------------|----------------------------|---------------------|--------------------|
| John Doe        | john.doe@university.edu    | LECTURER            | Computer Science   |
| Jane Smith      | jane.smith@university.edu  | ADMIN               | Administration     |
| Bob Johnson     | bob.johnson@university.edu | HEAD_OF_DEPARTMENT  | Mathematics        |
| Alice Williams  | alice.w@university.edu     | ACADEMIC_AFFAIRS    | Academic Affairs   |
```

**Note:** The downloaded template includes:

- Properly formatted header row
- 5 sample data rows
- Instructions sheet with detailed guidelines
- Auto-sized columns for better readability

### Valid Role Codes

- ADMIN
- LECTURER
- HEAD_OF_DEPARTMENT
- ACADEMIC_AFFAIRS
- PRINCIPAL
- STUDENT

### Department Code

- Use the exact department name as stored in the system
- Department must exist in the database before import
- Case-sensitive matching

## Validation Rules

### Email Validation

- Must be in valid email format
- Must be unique (not already registered)
- Required field

### Full Name

- Cannot be empty
- Required field

### Role Code

- Must match an existing role in the system
- Required field

### Department Code

- Must match an existing department name in the system
- Required field

## User Account Creation

### Automatic Actions

1. **Username Generation**: Extracted from email (before @ symbol)
   - If username exists, a numeric suffix is added (e.g., john.doe, john.doe1, john.doe2)

2. **Password Generation**: Random secure password (12 characters)
   - Contains uppercase, lowercase, numbers, and special characters
   - Sent to user via email (or logged for now)

3. **Account Status**: Set to ACTIVE by default

4. **Role Assignment**: User is assigned the specified role

## Error Handling

### Common Errors

- **"Email already exists"**: Email is already registered in the system
- **"Invalid role code"**: Role does not exist in the system
- **"Invalid department code"**: Department does not exist in the system
- **"Email is required"**: Email field is empty
- **"Invalid email format"**: Email format is incorrect

### Response

- Successfully imported users are created in the database
- Errors are returned with row number and specific error message
- Partial success is supported (valid rows are imported even if some rows have errors)

## Usage Example

### Step 1: Download Template

```bash
# Download the Excel template
curl -X GET "http://localhost:8080/api/users/bulk-import/template" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o user_import_template.xlsx
```

### Step 2: Prepare Your Data

1. Open the downloaded `user_import_template.xlsx`
2. Review the **Instructions** sheet
3. Edit the **Users** sheet:
   - Delete sample data rows
   - Add your actual user data
   - Ensure all required fields are filled
4. Save the file

### Step 3: Upload the File

#### Using cURL

```bash
curl -X POST "http://localhost:8080/api/users/bulk-import" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@user_import_template.xlsx"
```

#### Using PowerShell

```powershell
# Download template
.\scripts\test-download-template.ps1

# Or test complete workflow
.\scripts\test-complete-workflow.ps1
```

#### Using Postman

1. Select POST method
2. Enter URL: `http://localhost:8080/api/users/bulk-import`
3. Go to Authorization tab and add Bearer Token
4. Go to Body tab
5. Select form-data
6. Add key: `file`, type: File
7. Choose your Excel file
8. Send request

## Best Practices

1. **Download Template First**: Always use the official template from `/api/users/bulk-import/template` endpoint
2. **Validate Data First**: Check that all roles and departments exist in the system
3. **Small Batches**: Import users in smaller batches (50-100 at a time) for better error handling
4. **Backup**: Keep a backup of the Excel file for reference
5. **Review Errors**: Carefully review error messages and correct data before re-importing
6. **Test Import**: Test with a small sample file first (2-3 users)
7. **Unique Emails**: Ensure all emails in the file are unique and not already in the system

## Workflow Recommendation

```
1. Download Template → 2. Edit Data → 3. Upload File → 4. Review Results
```

**Complete Workflow Script:**

```powershell
# Run the complete workflow test
.\scripts\test-complete-workflow.ps1
```

This script will:

- Download the template automatically
- Open it for you to edit
- Upload and import the users
- Display detailed results

## Security Considerations

1. **Access Control**: Only ADMIN and PRINCIPAL roles can perform bulk imports
2. **Password Security**: Generated passwords are random and secure
3. **Email Verification**: Users should verify email ownership (implement email confirmation if needed)
4. **Audit Trail**: All user creations are logged with timestamps

## Future Enhancements

- [x] **Template download endpoint** - ✅ Implemented
- [ ] Email notification to users with their credentials
- [ ] Support for .xls format (older Excel format)
- [ ] CSV file support
- [ ] Bulk user update functionality
- [ ] Dry-run mode (validate without creating accounts)
- [ ] Import history and rollback capability
