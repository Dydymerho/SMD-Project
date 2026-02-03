# CLO-PLO Mapping API Documentation

## Tổng quan

API này cung cấp các endpoint để quản lý mapping giữa Course Learning Outcomes (CLO) và Program Learning Outcomes (PLO).

## Base URL

```
/api/clo-plo-mappings
```

## Endpoints

### 1. Lấy tất cả mappings

```http
GET /api/clo-plo-mappings
```

**Response:**

```json
[
  {
    "mappingId": 1,
    "cloId": 1,
    "cloCode": "CLO1",
    "cloDescription": "Understand basic concepts",
    "ploId": 1,
    "ploCode": "PLO1",
    "ploDescription": "Apply knowledge",
    "mappingLevel": "HIGH"
  }
]
```

### 2. Lấy mapping theo ID

```http
GET /api/clo-plo-mappings/{id}
```

**Parameters:**

- `id` (path): Mapping ID

**Response:**

```json
{
  "mappingId": 1,
  "cloId": 1,
  "cloCode": "CLO1",
  "cloDescription": "Understand basic concepts",
  "ploId": 1,
  "ploCode": "PLO1",
  "ploDescription": "Apply knowledge",
  "mappingLevel": "HIGH"
}
```

### 3. Lấy mappings theo CLO

```http
GET /api/clo-plo-mappings/clo/{cloId}
```

**Parameters:**

- `cloId` (path): CLO ID

**Response:**

```json
[
  {
    "mappingId": 1,
    "cloId": 1,
    "cloCode": "CLO1",
    "cloDescription": "Understand basic concepts",
    "ploId": 1,
    "ploCode": "PLO1",
    "ploDescription": "Apply knowledge",
    "mappingLevel": "HIGH"
  }
]
```

### 4. Lấy mappings theo PLO

```http
GET /api/clo-plo-mappings/plo/{ploId}
```

**Parameters:**

- `ploId` (path): PLO ID

**Response:**

```json
[
  {
    "mappingId": 1,
    "cloId": 1,
    "cloCode": "CLO1",
    "cloDescription": "Understand basic concepts",
    "ploId": 1,
    "ploCode": "PLO1",
    "ploDescription": "Apply knowledge",
    "mappingLevel": "HIGH"
  }
]
```

### 5. Lấy mappings theo Syllabus

```http
GET /api/clo-plo-mappings/syllabus/{syllabusId}
```

**Parameters:**

- `syllabusId` (path): Syllabus ID

**Response:**

```json
[
  {
    "mappingId": 1,
    "cloId": 1,
    "cloCode": "CLO1",
    "cloDescription": "Understand basic concepts",
    "ploId": 1,
    "ploCode": "PLO1",
    "ploDescription": "Apply knowledge",
    "mappingLevel": "HIGH"
  }
]
```

### 6. Lấy mappings theo Program

```http
GET /api/clo-plo-mappings/program/{programId}
```

**Parameters:**

- `programId` (path): Program ID

**Response:**

```json
[
  {
    "mappingId": 1,
    "cloId": 1,
    "cloCode": "CLO1",
    "cloDescription": "Understand basic concepts",
    "ploId": 1,
    "ploCode": "PLO1",
    "ploDescription": "Apply knowledge",
    "mappingLevel": "HIGH"
  }
]
```

### 7. Tạo mapping mới

```http
POST /api/clo-plo-mappings
```

**Request Body:**

```json
{
  "cloId": 1,
  "ploId": 1,
  "mappingLevel": "HIGH"
}
```

**Mapping Levels:**

- `LOW`: Mức độ liên quan thấp
- `MEDIUM`: Mức độ liên quan trung bình
- `HIGH`: Mức độ liên quan cao

**Response:** (201 Created)

```json
{
  "mappingId": 1,
  "cloId": 1,
  "cloCode": "CLO1",
  "cloDescription": "Understand basic concepts",
  "ploId": 1,
  "ploCode": "PLO1",
  "ploDescription": "Apply knowledge",
  "mappingLevel": "HIGH"
}
```

### 8. Tạo nhiều mappings cho một CLO

```http
POST /api/clo-plo-mappings/batch
```

**Request Body:**

```json
{
  "cloId": 1,
  "ploIds": [1, 2, 3],
  "mappingLevel": "MEDIUM"
}
```

**Response:** (201 Created)

```json
[
  {
    "mappingId": 1,
    "cloId": 1,
    "cloCode": "CLO1",
    "cloDescription": "Understand basic concepts",
    "ploId": 1,
    "ploCode": "PLO1",
    "ploDescription": "Apply knowledge",
    "mappingLevel": "MEDIUM"
  },
  {
    "mappingId": 2,
    "cloId": 1,
    "cloCode": "CLO1",
    "cloDescription": "Understand basic concepts",
    "ploId": 2,
    "ploCode": "PLO2",
    "ploDescription": "Analyze problems",
    "mappingLevel": "MEDIUM"
  }
]
```

### 9. Cập nhật mapping level

```http
PUT /api/clo-plo-mappings/{id}
```

**Parameters:**

- `id` (path): Mapping ID

**Request Body:**

```json
{
  "mappingLevel": "LOW"
}
```

**Response:**

```json
{
  "mappingId": 1,
  "cloId": 1,
  "cloCode": "CLO1",
  "cloDescription": "Understand basic concepts",
  "ploId": 1,
  "ploCode": "PLO1",
  "ploDescription": "Apply knowledge",
  "mappingLevel": "LOW"
}
```

### 10. Xóa mapping

```http
DELETE /api/clo-plo-mappings/{id}
```

**Parameters:**

- `id` (path): Mapping ID

**Response:** (204 No Content)

### 11. Xóa tất cả mappings của một CLO

```http
DELETE /api/clo-plo-mappings/clo/{cloId}
```

**Parameters:**

- `cloId` (path): CLO ID

**Response:** (204 No Content)

### 12. Xóa tất cả mappings của một PLO

```http
DELETE /api/clo-plo-mappings/plo/{ploId}
```

**Parameters:**

- `ploId` (path): PLO ID

**Response:** (204 No Content)

---

## Enhanced CLO API

### Lấy CLO với thông tin mappings

```http
GET /api/clos/{id}/with-mappings
```

**Response:**

```json
{
  "cloId": 1,
  "syllabusId": 1,
  "cloCode": "CLO1",
  "cloDescription": "Understand basic concepts",
  "ploMappings": [
    {
      "ploId": 1,
      "ploCode": "PLO1",
      "mappingLevel": "HIGH"
    },
    {
      "ploId": 2,
      "ploCode": "PLO2",
      "mappingLevel": "MEDIUM"
    }
  ]
}
```

---

## Enhanced PLO API

### Lấy PLO với coverage statistics

```http
GET /api/plos/{id}/with-coverage
```

**Response:**

```json
{
  "ploId": 1,
  "programId": 1,
  "ploCode": "PLO1",
  "ploDescription": "Apply knowledge",
  "totalMappedCLOs": 5,
  "cloMappings": [
    {
      "cloId": 1,
      "cloCode": "CLO1",
      "syllabusId": 1,
      "courseCode": "CS101",
      "mappingLevel": "HIGH"
    },
    {
      "cloId": 2,
      "cloCode": "CLO2",
      "syllabusId": 2,
      "courseCode": "CS102",
      "mappingLevel": "MEDIUM"
    }
  ]
}
```

---

## Error Responses

### 404 Not Found

```json
{
  "timestamp": "2026-01-30T10:15:30.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Mapping not found with id: 999",
  "path": "/api/clo-plo-mappings/999"
}
```

### 400 Bad Request

```json
{
  "timestamp": "2026-01-30T10:15:30.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Mapping already exists between CLO 1 and PLO 1",
  "path": "/api/clo-plo-mappings"
}
```

### 400 Invalid Mapping Level

```json
{
  "timestamp": "2026-01-30T10:15:30.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid mapping level: INVALID. Must be LOW, MEDIUM, or HIGH",
  "path": "/api/clo-plo-mappings"
}
```

---

## Use Cases

### 1. Tạo syllabus với CLO-PLO mapping

```javascript
// 1. Tạo CLO
const cloResponse = await fetch("/api/clos", {
  method: "POST",
  body: JSON.stringify({
    syllabusId: 1,
    cloCode: "CLO1",
    cloDescription: "Understand basic concepts",
  }),
});
const clo = await cloResponse.json();

// 2. Tạo mappings cho CLO
const mappingResponse = await fetch("/api/clo-plo-mappings/batch", {
  method: "POST",
  body: JSON.stringify({
    cloId: clo.cloId,
    ploIds: [1, 2, 3],
    mappingLevel: "HIGH",
  }),
});
```

### 2. Xem coverage của PLO trong program

```javascript
// Lấy tất cả PLOs của program
const plosResponse = await fetch("/api/plos/program/1");
const plos = await plosResponse.json();

// Lấy coverage cho từng PLO
for (const plo of plos) {
  const detailResponse = await fetch(`/api/plos/${plo.ploId}/with-coverage`);
  const detail = await detailResponse.json();
  console.log(`${detail.ploCode}: ${detail.totalMappedCLOs} CLOs mapped`);
}
```

### 3. Xem tất cả mappings của syllabus

```javascript
const response = await fetch("/api/clo-plo-mappings/syllabus/1");
const mappings = await response.json();

// Group by mapping level
const grouped = mappings.reduce((acc, m) => {
  acc[m.mappingLevel] = acc[m.mappingLevel] || [];
  acc[m.mappingLevel].push(m);
  return acc;
}, {});
```

---

## Notes

1. **Cascade Delete**: Khi xóa CLO hoặc PLO, các mappings liên quan sẽ tự động bị xóa (nếu được cấu hình trong entity)
2. **Duplicate Check**: API sẽ không cho phép tạo duplicate mapping giữa cùng một CLO và PLO
3. **Validation**: Mapping level phải là một trong ba giá trị: LOW, MEDIUM, HIGH
4. **Batch Operations**: Sử dụng endpoint `/batch` để tạo nhiều mappings cùng lúc, tiết kiệm số lượng API calls
