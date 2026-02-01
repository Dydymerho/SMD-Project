# Quick Start Guide - Bulk User Import

## Step-by-Step Instructions

### Step 1: Prepare Your Excel File

Create a new Excel file (.xlsx) with the following structure:

**File Name**: `users_import.xlsx`

**Sheet 1 Content**:

| Full Name     | Email                      | Role Code          | Department Code  |
| ------------- | -------------------------- | ------------------ | ---------------- |
| Nguyen Van An | nguyenvanan@university.edu | LECTURER           | Computer Science |
| Tran Thi Binh | tranthib@university.edu    | LECTURER           | Mathematics      |
| Le Van Cuong  | levanc@university.edu      | HEAD_OF_DEPARTMENT | Computer Science |
| Pham Thi Dung | phamthid@university.edu    | ADMIN              | Administration   |
| Hoang Van Em  | hoangvane@university.edu   | ACADEMIC_AFFAIRS   | Academic Affairs |

### Step 2: Verify Data

Before uploading, check:

- ✅ All emails are unique and valid format
- ✅ Role codes match: ADMIN, LECTURER, HEAD_OF_DEPARTMENT, ACADEMIC_AFFAIRS, PRINCIPAL, STUDENT
- ✅ Department codes match exact names in your database
- ✅ No empty cells in required columns
- ✅ File saved as .xlsx format

### Step 3: Get Authentication Token

Login to get your JWT token:

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'
```

Copy the token from response.

### Step 4: Upload File

**Option A: Using cURL**

```bash
curl -X POST "http://localhost:8080/api/users/bulk-import" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@users_import.xlsx"
```

**Option B: Using PowerShell**

```powershell
# Save this as a .ps1 file
$token = "YOUR_TOKEN_HERE"
$file = "users_import.xlsx"

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/users/bulk-import" `
  -Method Post `
  -Headers @{"Authorization" = "Bearer $token"} `
  -Form @{file = Get-Item -Path $file}

$response | ConvertTo-Json -Depth 10
```

**Option C: Using Postman**

1. Create new request
2. Method: POST
3. URL: `http://localhost:8080/api/users/bulk-import`
4. Authorization Tab:
   - Type: Bearer Token
   - Token: [Your JWT Token]
5. Body Tab:
   - Type: form-data
   - Key: `file` (change type to File)
   - Value: Select your Excel file
6. Click Send

### Step 5: Review Results

**Success Response**:

```json
{
  "totalRows": 5,
  "successCount": 5,
  "errorCount": 0,
  "message": "Successfully imported 5 users, 0 errors",
  "errors": []
}
```

**Partial Success Response**:

```json
{
  "totalRows": 5,
  "successCount": 3,
  "errorCount": 2,
  "message": "Successfully imported 3 users, 2 errors",
  "errors": [
    {
      "rowNumber": 3,
      "fullName": "Le Van Cuong",
      "email": "levanc@university.edu",
      "roleCode": "INVALID_ROLE",
      "departmentCode": "Computer Science",
      "errorMessage": "Invalid role code: INVALID_ROLE"
    },
    {
      "rowNumber": 5,
      "fullName": "Hoang Van Em",
      "email": "duplicate@university.edu",
      "roleCode": "ACADEMIC_AFFAIRS",
      "departmentCode": "Academic Affairs",
      "errorMessage": "Email already exists: duplicate@university.edu"
    }
  ]
}
```

### Step 6: Check Created Users

**Verify in database**:

```sql
SELECT user_id, username, full_name, email, status
FROM "user"
ORDER BY created_at DESC
LIMIT 10;
```

**Check via API**:

```bash
curl -X GET "http://localhost:8080/api/users" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues & Solutions

### Issue 1: "File is empty"

**Solution**: Make sure you selected the correct file and it contains data

### Issue 2: "Invalid file format"

**Solution**: Save your file as .xlsx (Excel 2007+), not .xls or .csv

### Issue 3: "Invalid role code"

**Solution**: Check your role codes match exactly:

- ADMIN
- LECTURER
- HEAD_OF_DEPARTMENT
- ACADEMIC_AFFAIRS
- PRINCIPAL
- STUDENT

### Issue 4: "Invalid department code"

**Solution**:

1. Get list of valid departments:

```bash
curl -X GET "http://localhost:8080/api/departments" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

2. Use exact department names from the list

### Issue 5: "Email already exists"

**Solution**: Check if user already registered, use different email

### Issue 6: "Access denied" (403)

**Solution**: Only ADMIN and PRINCIPAL roles can bulk import. Check your role.

### Issue 7: "Unauthorized" (401)

**Solution**: Your token expired or invalid. Login again to get new token.

## Testing Checklist

Before production use, test with this checklist:

- [ ] Created test Excel file with 3-5 users
- [ ] Verified all role codes are valid
- [ ] Verified all department codes are valid
- [ ] Confirmed all emails are unique
- [ ] Successfully uploaded test file
- [ ] Reviewed response for any errors
- [ ] Verified users created in database
- [ ] Tested with intentional errors (invalid role, duplicate email)
- [ ] Confirmed partial success works correctly
- [ ] Documented generated passwords for test users

## Production Recommendations

### Before First Import:

1. Backup your database
2. Test on staging environment first
3. Prepare rollback plan
4. Notify team about user creation

### During Import:

1. Import in small batches (50-100 users)
2. Verify each batch before continuing
3. Keep Excel files for reference
4. Document any issues encountered

### After Import:

1. Verify all users created successfully
2. Test login with sample accounts
3. Send credentials to users (implement email notification)
4. Monitor for issues in first 24 hours
5. Archive Excel files securely

## Getting Help

If you encounter issues:

1. **Check Logs**:

   ```bash
   tail -f logs/application.log
   ```

2. **Review Documentation**:
   - [BULK_USER_IMPORT.md](./BULK_USER_IMPORT.md) - Detailed API docs
   - [BULK_USER_IMPORT_VI.md](./BULK_USER_IMPORT_VI.md) - Vietnamese docs
   - [BULK_IMPORT_IMPLEMENTATION.md](../BULK_IMPORT_IMPLEMENTATION.md) - Technical details

3. **Test API Connection**:

   ```bash
   curl -X GET "http://localhost:8080/api/users" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Contact Support**: Provide error message, row number, and sample data

## Next Steps

After successfully importing users:

1. **Implement Email Notifications**: Send credentials to new users
2. **Setup Password Reset**: Allow users to change initial password
3. **Configure Email Verification**: Verify user email addresses
4. **Setup Audit Logging**: Track all user import activities
5. **Create Import History**: Keep record of all imports

---

**Need more help?** Check the complete documentation in the `docs/` folder.
