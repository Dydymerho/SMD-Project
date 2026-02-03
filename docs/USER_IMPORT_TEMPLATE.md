# Sample User Import Data (Copy to Excel)

Use this template to prepare your bulk user import file.

## Instructions:

1. Create a new Excel file (.xlsx)
2. Copy the header row and sample data below
3. Replace sample data with your actual users
4. Save the file
5. Upload via the bulk import API endpoint

## Excel Template Format:

| Full Name      | Email                      | Role Code          | Department Code  |
| -------------- | -------------------------- | ------------------ | ---------------- |
| John Doe       | john.doe@university.edu    | LECTURER           | Computer Science |
| Jane Smith     | jane.smith@university.edu  | ADMIN              | Administration   |
| Bob Johnson    | bob.johnson@university.edu | HEAD_OF_DEPARTMENT | Mathematics      |
| Alice Williams | alice.w@university.edu     | ACADEMIC_AFFAIRS   | Academic Affairs |
| Charlie Brown  | charlie.b@university.edu   | LECTURER           | Physics          |
| Diana Prince   | diana.p@university.edu     | LECTURER           | Chemistry        |
| Edward Norton  | edward.n@university.edu    | PRINCIPAL          | Administration   |
| Fiona Green    | fiona.g@university.edu     | LECTURER           | Biology          |
| George Martin  | george.m@university.edu    | HEAD_OF_DEPARTMENT | Computer Science |
| Hannah White   | hannah.w@university.edu    | STUDENT            | Computer Science |

## Valid Role Codes:

- ADMIN: System administrator
- LECTURER: Faculty member/teacher
- HEAD_OF_DEPARTMENT: Department head
- ACADEMIC_AFFAIRS: Academic affairs staff
- PRINCIPAL: School principal/director
- STUDENT: Student account

## Important Notes:

1. **Email addresses must be unique** across the entire system
2. **Department Code** must match exactly with department names in your database
3. All fields are **required** - do not leave any cells empty
4. First row MUST be the header row
5. File format must be **.xlsx** (Excel 2007 or later)
6. Maximum recommended: 100 users per file for optimal performance

## Testing Your File:

Before importing production data:

1. Test with 2-3 sample users first
2. Verify all departments exist in the system
3. Ensure all email addresses are valid and unique
4. Double-check role codes match exactly (case-sensitive)

## Common Mistakes to Avoid:

❌ Leaving empty rows in the middle of data
❌ Using .xls instead of .xlsx format
❌ Misspelling role codes or department names
❌ Including duplicate email addresses
❌ Using email addresses that already exist in the system
❌ Forgetting to include the header row
