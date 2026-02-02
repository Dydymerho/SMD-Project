# Upload và Download File PDF/Word cho Syllabus

## ✅ Đã cập nhật

Hệ thống hiện đã hỗ trợ upload và download cả file **PDF** và **Word** (.doc, .docx).

## 📋 Các định dạng được hỗ trợ

- ✅ **PDF** (.pdf) - `application/pdf`
- ✅ **Word 97-2003** (.doc) - `application/msword`
- ✅ **Word 2007+** (.docx) - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## 🔧 Giới hạn

- **Kích thước tối đa**: 10MB
- **Số lượng file**: 1 file/syllabus
- **Upload file mới**: Tự động xóa file cũ

## 📡 API Endpoints

### 1. Upload File

```http
POST /api/syllabuses/{id}/upload-pdf
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
  file: [binary file - PDF, DOC, or DOCX]
```

**Quyền**: Lecturer (owner), Admin, Department Head

**Response**:

```json
{
  "syllabusId": 1,
  "fileName": "syllabus_programming.docx",
  "filePath": "uploads/syllabus/pdf/1_uuid.docx",
  "fileSize": 2048576,
  "uploadedAt": "2026-02-02T10:30:00",
  "message": "PDF uploaded successfully"
}
```

### 2. Download File

```http
GET /api/syllabuses/{id}/download-pdf
Authorization: Bearer {token}
```

**Response**: Binary file với đúng Content-Type:

- PDF: `application/pdf`
- DOCX: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- DOC: `application/msword`

### 3. Xem thông tin File

```http
GET /api/syllabuses/{id}/pdf-info
```

### 4. Xóa File

```http
DELETE /api/syllabuses/{id}/delete-pdf
Authorization: Bearer {token}
```

## 💻 Frontend Examples

### React - File Upload với validation

```typescript
const handleFileUpload = async (syllabusId: number, file: File) => {
  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExt)) {
    alert('Chỉ chấp nhận file PDF hoặc Word (.pdf, .doc, .docx)');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('Kích thước file tối đa 10MB');
    return;
  }

  // Upload
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_URL}/api/syllabuses/${syllabusId}/upload-pdf`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    }
  );

  const result = await response.json();
  console.log('Upload success:', result);
};

// File input component
<input
  type="file"
  accept=".pdf,.doc,.docx"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(syllabusId, file);
  }}
/>
```

### React Native - Document Picker

```typescript
import DocumentPicker from "react-native-document-picker";

const pickAndUploadDocument = async (syllabusId: number) => {
  try {
    const result = await DocumentPicker.pick({
      type: [
        DocumentPicker.types.pdf,
        DocumentPicker.types.doc,
        DocumentPicker.types.docx,
      ],
    });

    const file = result[0];

    // Validate size
    if (file.size > 10 * 1024 * 1024) {
      Alert.alert("Lỗi", "File không được vượt quá 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type,
      name: file.name,
    });

    const response = await fetch(
      `${API_URL}/api/syllabuses/${syllabusId}/upload-pdf`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      },
    );

    if (response.ok) {
      Alert.alert("Thành công", "Tải file lên thành công");
    }
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled
    } else {
      Alert.alert("Lỗi", err.message);
    }
  }
};
```

## 🧪 Test với PowerShell

```powershell
# Test upload PDF
$file = "C:\path\to\file.pdf"
$uri = "http://localhost:8081/api/syllabuses/1/upload-pdf"
$token = "your_jwt_token"

$headers = @{
    "Authorization" = "Bearer $token"
}

# Upload
$result = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -InFile $file -ContentType "multipart/form-data"
$result | ConvertTo-Json

# Download
$downloadUri = "http://localhost:8081/api/syllabuses/1/download-pdf"
Invoke-RestMethod -Uri $downloadUri -Method Get -Headers $headers -OutFile "downloaded_file.pdf"

# Get info
$infoUri = "http://localhost:8081/api/syllabuses/1/pdf-info"
Invoke-RestMethod -Uri $infoUri -Method Get -Headers $headers | ConvertTo-Json
```

## 🔍 Validation Messages

### Upload Errors

**Sai định dạng**:

```json
{
  "message": "Only PDF and Word files are allowed (.pdf, .doc, .docx). Current type: image/jpeg"
}
```

**Quá kích thước**:

```json
{
  "message": "File size exceeds maximum allowed size of 10MB"
}
```

**Không có quyền**:

```json
{
  "message": "You don't have permission to upload PDF for this syllabus. Only the lecturer, admin, or department head can upload."
}
```

## ✨ Tính năng mới

1. **Auto-detect Content-Type**: Hệ thống tự động xác định loại file khi download dựa trên extension
2. **Multi-format Support**: Hỗ trợ cả PDF và Word formats
3. **Proper File Naming**: Download file với tên gốc thay vì generic name
4. **Better Validation**: Validation messages rõ ràng hơn

## 📝 Notes

- File được lưu trong thư mục `uploads/syllabus/pdf/` (tên thư mục giữ nguyên để tương thích ngược)
- Database columns vẫn giữ tên `pdf_file_*` (không breaking change)
- API endpoints vẫn giữ path `/upload-pdf`, `/download-pdf` (tương thích ngược)
- Chỉ có validation và content-type handling được cập nhật

## 🚀 Deploy

Sau khi cập nhật code, restart service:

```bash
cd core-service/core-service
mvn clean package
java -jar target/core-service-0.0.1-SNAPSHOT.jar
```

Hoặc với Docker:

```bash
docker-compose down
docker-compose up --build
```
