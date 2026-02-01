package com.smd.core.service;

import com.smd.core.dto.BulkUserImportResponse;
import com.smd.core.dto.UserImportError;
import com.smd.core.dto.UserImportRow;
import com.smd.core.entity.Department;
import com.smd.core.entity.Role;
import com.smd.core.entity.User;
import com.smd.core.entity.UserRole;
import com.smd.core.repository.DepartmentRepository;
import com.smd.core.repository.RoleRepository;
import com.smd.core.repository.UserRepository;
import com.smd.core.repository.UserRoleRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

/**
 * Service for handling bulk user import from Excel files
 */
@Service
public class BulkUserImportService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD = "Password123";

    /**
     * Process bulk user import from Excel file
     * Expected columns: Username, Full Name, Email, Role Code, Department Code
     */
    @Transactional
    public BulkUserImportResponse importUsers(MultipartFile file) throws IOException {
        List<UserImportRow> rows = parseExcelFile(file);
        List<UserImportError> errors = new ArrayList<>();
        int successCount = 0;

        for (UserImportRow row : rows) {
            try {
                validateAndCreateUser(row);
                successCount++;
            } catch (Exception e) {
                errors.add(UserImportError.builder()
                        .rowNumber(row.getRowNumber())
                        .username(row.getUsername())
                        .fullName(row.getFullName())
                        .email(row.getEmail())
                        .roleCode(row.getRoleCode())
                        .departmentCode(row.getDepartmentCode())
                        .errorMessage(e.getMessage())
                        .build());
            }
        }

        return BulkUserImportResponse.builder()
                .totalRows(rows.size())
                .successCount(successCount)
                .errorCount(errors.size())
                .errors(errors)
                .message(String.format("Successfully imported %d users, %d errors", successCount, errors.size()))
                .build();
    }

    /**
     * Parse Excel file and extract user data
     */
    private List<UserImportRow> parseExcelFile(MultipartFile file) throws IOException {
        List<UserImportRow> rows = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip header row
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            int rowNumber = 1;
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                rowNumber++;

                // Skip empty rows
                if (isRowEmpty(row)) {
                    continue;
                }

                UserImportRow userRow = UserImportRow.builder()
                        .rowNumber(rowNumber)
                        .username(getCellValueAsString(row.getCell(0)))
                        .fullName(getCellValueAsString(row.getCell(1)))
                        .email(getCellValueAsString(row.getCell(2)))
                        .roleCode(getCellValueAsString(row.getCell(3)))
                        .departmentCode(getCellValueAsString(row.getCell(4)))
                        .build();

                rows.add(userRow);
            }
        }

        return rows;
    }

    /**
     * Validate and create user account
     */
    private void validateAndCreateUser(UserImportRow row) {
        // Validate required fields
        if (isEmpty(row.getUsername())) {
            throw new IllegalArgumentException("Username is required");
        }
        if (isEmpty(row.getFullName())) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (isEmpty(row.getEmail())) {
            throw new IllegalArgumentException("Email is required");
        }
        if (isEmpty(row.getRoleCode())) {
            throw new IllegalArgumentException("Role code is required");
        }
        if (isEmpty(row.getDepartmentCode())) {
            throw new IllegalArgumentException("Department code is required");
        }

        // Validate email format
        if (!isValidEmail(row.getEmail())) {
            throw new IllegalArgumentException("Invalid email format");
        }

        // Check email uniqueness
        if (userRepository.existsByEmail(row.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + row.getEmail());
        }

        // Check username uniqueness
        if (userRepository.existsByUsername(row.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + row.getUsername());
        }

        // Validate role exists
        Optional<Role> roleOpt = roleRepository.findByRoleName(row.getRoleCode());
        if (roleOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid role code: " + row.getRoleCode());
        }
        Role role = roleOpt.get();

        // Validate department exists
        Optional<Department> deptOpt = departmentRepository.findByDeptName(row.getDepartmentCode());
        if (deptOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid department code: " + row.getDepartmentCode());
        }
        Department department = deptOpt.get();

        // Use default password for all users
        String password = DEFAULT_PASSWORD;

        // Create user
        User user = User.builder()
                .username(row.getUsername())
                .passwordHash(passwordEncoder.encode(password))
                .fullName(row.getFullName())
                .email(row.getEmail())
                .department(department)
                .status(User.UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Assign role
        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .build();
        userRoleRepository.save(userRole);

        // TODO: Send email with credentials to the user
        // For now, just log the credentials (in production, this should be sent via email)
        System.out.println("User created - Username: " + row.getUsername() + ", Password: " + password + ", Email: " + row.getEmail());
    }

    /**
     * Get cell value as string
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getDateCellValue().toString();
                } else {
                    yield String.valueOf((long) cell.getNumericCellValue());
                }
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    /**
     * Check if row is empty
     */
    private boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }
        for (int i = 0; i < 5; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellValueAsString(cell).isEmpty()) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if string is empty
     */
    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    /**
     * Validate email format
     */
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email != null && email.matches(emailRegex);
    }

    /**
     * Generate Excel template file with sample data
     */
    public byte[] generateExcelTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Users");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Username", "Full Name", "Email", "Role Code", "Department Code"};

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create sample data rows
            String[][] sampleData = {
                {"johndoe", "John Doe", "john.doe@university.edu", "LECTURER", "Computer Science"},
                {"janesmith", "Jane Smith", "jane.smith@university.edu", "ADMIN", "Administration"},
                {"bobjohnson", "Bob Johnson", "bob.johnson@university.edu", "HEAD_OF_DEPARTMENT", "Mathematics"},
                {"alicewilliams", "Alice Williams", "alice.williams@university.edu", "ACADEMIC_AFFAIRS", "Academic Affairs"},
                {"charliebrown", "Charlie Brown", "charlie.brown@university.edu", "LECTURER", "Physics"}
            };

            // Create data style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            for (int i = 0; i < sampleData.length; i++) {
                Row row = sheet.createRow(i + 1);
                for (int j = 0; j < sampleData[i].length; j++) {
                    Cell cell = row.createCell(j);
                    cell.setCellValue(sampleData[i][j]);
                    cell.setCellStyle(dataStyle);
                }
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                // Add extra width for better readability
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }

            // Add instructions sheet
            Sheet instructionsSheet = workbook.createSheet("Instructions");
            
            CellStyle instructionTitleStyle = workbook.createCellStyle();
            Font instructionFont = workbook.createFont();
            instructionFont.setBold(true);
            instructionFont.setFontHeightInPoints((short) 14);
            instructionTitleStyle.setFont(instructionFont);

            String[] instructions = {
                "BULK USER IMPORT TEMPLATE - INSTRUCTIONS",
                "",
                "Column Descriptions:",
                "1. Username - User's login username, must be unique (Required)",
                "2. Full Name - User's full name (Required)",
                "3. Email - User's email address, must be unique (Required)",
                "4. Role Code - User's role, must match existing roles (Required)",
                "5. Department Code - Department name, must match existing departments (Required)",
                "",
                "Default Password:",
                "- All users will be created with default password: Password123",
                "- Users should change their password on first login",
                "",
                "Valid Role Codes:",
                "- ADMIN: System administrator",
                "- LECTURER: Faculty member/teacher",
                "- HEAD_OF_DEPARTMENT: Department head",
                "- ACADEMIC_AFFAIRS: Academic affairs staff",
                "- PRINCIPAL: School principal/director",
                "- STUDENT: Student account",
                "",
                "Important Notes:",
                "- All fields are required, do not leave any cells empty",
                "- Username must be unique across the system",
                "- Email addresses must be unique across the system",
                "- Department Code must match exactly with department names in database",
                "- Role Code must match exactly (case-sensitive)",
                "- Delete sample data rows before adding your real data",
                "- Keep the header row (Row 1) intact",
                "- Save file as .xlsx format",
                "",
                "Tips:",
                "- Test with 2-3 users first before bulk import",
                "- Recommended batch size: 50-100 users per file",
                "- Verify all departments exist in system before import",
                "- Keep a backup copy of your Excel file"
            };

            for (int i = 0; i < instructions.length; i++) {
                Row row = instructionsSheet.createRow(i);
                Cell cell = row.createCell(0);
                cell.setCellValue(instructions[i]);
                if (i == 0) {
                    cell.setCellStyle(instructionTitleStyle);
                }
            }

            instructionsSheet.setColumnWidth(0, 15000);

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}
