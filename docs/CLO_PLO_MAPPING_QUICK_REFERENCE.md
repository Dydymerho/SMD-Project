# CLO-PLO Mapping Quick Reference

## 🚀 Quick Start

### 1. Tạo mapping đơn

```bash
curl -X POST http://localhost:8080/api/clo-plo-mappings \
  -H "Content-Type: application/json" \
  -d '{"cloId": 1, "ploId": 1, "mappingLevel": "HIGH"}'
```

### 2. Tạo nhiều mappings cùng lúc

```bash
curl -X POST http://localhost:8080/api/clo-plo-mappings/batch \
  -H "Content-Type: application/json" \
  -d '{"cloId": 1, "ploIds": [1,2,3], "mappingLevel": "MEDIUM"}'
```

### 3. Xem mappings của syllabus

```bash
curl http://localhost:8080/api/clo-plo-mappings/syllabus/1
```

### 4. Xem CLO với PLO mappings

```bash
curl http://localhost:8080/api/clos/1/with-mappings
```

### 5. Xem PLO với coverage

```bash
curl http://localhost:8080/api/plos/1/with-coverage
```

## 📋 Mapping Levels

| Level  | Ý nghĩa              | Use Case                            |
| ------ | -------------------- | ----------------------------------- |
| LOW    | Liên quan thấp       | CLO chỉ liên quan gián tiếp đến PLO |
| MEDIUM | Liên quan trung bình | CLO hỗ trợ một phần PLO             |
| HIGH   | Liên quan cao        | CLO đóng góp trực tiếp cho PLO      |

## 🎯 Common Use Cases

### Use Case 1: Tạo syllabus mới với mappings

```javascript
// 1. Tạo CLOs
const clo1 = await createCLO({ syllabusId: 1, cloCode: "CLO1", ... });
const clo2 = await createCLO({ syllabusId: 1, cloCode: "CLO2", ... });

// 2. Map CLOs với PLOs
await createBatchMappings({
  cloId: clo1.cloId,
  ploIds: [1, 2, 3],
  mappingLevel: "HIGH"
});
```

### Use Case 2: Xem coverage của program

```javascript
// Get all PLOs của program
const plos = await getPLOsByProgramId(1);

// Get coverage cho từng PLO
for (const plo of plos) {
  const coverage = await getPLOWithCoverage(plo.ploId);
  console.log(`${coverage.ploCode}: ${coverage.totalMappedCLOs} CLOs`);
}
```

### Use Case 3: Review mappings trong syllabus approval

```javascript
// Get all mappings
const mappings = await getMappingsBySyllabusId(syllabusId);

// Group by level
const high = mappings.filter((m) => m.mappingLevel === "HIGH");
const medium = mappings.filter((m) => m.mappingLevel === "MEDIUM");
const low = mappings.filter((m) => m.mappingLevel === "LOW");
```

## 🔍 Query Patterns

### Lấy tất cả mappings

```
GET /api/clo-plo-mappings
```

### Lọc theo entity

```
GET /api/clo-plo-mappings/clo/{cloId}        // Theo CLO
GET /api/clo-plo-mappings/plo/{ploId}        // Theo PLO
GET /api/clo-plo-mappings/syllabus/{id}      // Theo Syllabus
GET /api/clo-plo-mappings/program/{id}       // Theo Program
```

### Enhanced queries

```
GET /api/clos/{id}/with-mappings              // CLO + mappings
GET /api/plos/{id}/with-coverage              // PLO + coverage
```

## ⚡ Performance Tips

### 1. Sử dụng batch operations

❌ **Bad:**

```javascript
for (const ploId of ploIds) {
  await createMapping(cloId, ploId, "HIGH");
}
```

✅ **Good:**

```javascript
await createBatchMappings(cloId, ploIds, "HIGH");
```

### 2. Cache mappings khi cần

```javascript
// Cache syllabus mappings
const mappings = await getMappingsBySyllabusId(syllabusId);
// Reuse mappings cho multiple operations
```

### 3. Sử dụng enhanced endpoints

```javascript
// Lấy CLO với mappings trong 1 call
const cloWithMappings = await getCLOWithMappings(cloId);
// Thay vì 2 calls riêng biệt
```

## 🐛 Common Errors

### Error: "Mapping already exists"

**Nguyên nhân:** Đã tồn tại mapping giữa CLO và PLO này
**Giải pháp:** Sử dụng PUT để update hoặc xóa mapping cũ

### Error: "CLO not found"

**Nguyên nhân:** CLO ID không tồn tại
**Giải pháp:** Check CLO ID trước khi tạo mapping

### Error: "Invalid mapping level"

**Nguyên nhân:** Mapping level không hợp lệ
**Giải pháp:** Chỉ dùng: LOW, MEDIUM, hoặc HIGH

## 📊 Response Format

### Single Mapping

```json
{
  "mappingId": 1,
  "cloId": 1,
  "cloCode": "CLO1",
  "cloDescription": "Understand concepts",
  "ploId": 1,
  "ploCode": "PLO1",
  "ploDescription": "Apply knowledge",
  "mappingLevel": "HIGH"
}
```

### CLO with Mappings

```json
{
  "cloId": 1,
  "syllabusId": 1,
  "cloCode": "CLO1",
  "cloDescription": "Understand concepts",
  "ploMappings": [
    {
      "ploId": 1,
      "ploCode": "PLO1",
      "mappingLevel": "HIGH"
    }
  ]
}
```

### PLO with Coverage

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
    }
  ]
}
```

## 🧪 Testing

### Run test script

```powershell
cd scripts
.\test-clo-plo-mapping.ps1
```

### Test với Postman

Import collection từ: `docs/CLO_PLO_MAPPING_API.md`

### Test với Swagger

Truy cập: `http://localhost:8080/swagger-ui.html`

## 📚 Documentation

| File                        | Purpose                |
| --------------------------- | ---------------------- |
| `CLO_PLO_MAPPING_API.md`    | Full API documentation |
| `CLO_PLO_MAPPING_README.md` | Implementation guide   |
| `IMPLEMENTATION_SUMMARY.md` | Project summary        |
| `test-clo-plo-mapping.ps1`  | Test script            |

## 💡 Best Practices

1. ✅ Luôn validate CLO và PLO trước khi map
2. ✅ Sử dụng batch operations cho multiple mappings
3. ✅ Cache mappings data khi có thể
4. ✅ Handle errors properly
5. ✅ Log important operations
6. ✅ Use meaningful mapping levels
7. ✅ Document mapping rationale in comments

## 🔗 Related APIs

- CLO API: `/api/clos`
- PLO API: `/api/plos`
- Syllabus API: `/api/syllabus`
- Program API: `/api/programs`

## 📞 Support

- API Documentation: `/swagger-ui.html`
- Test Script: `scripts/test-clo-plo-mapping.ps1`
- Issues: Check IMPLEMENTATION_SUMMARY.md
