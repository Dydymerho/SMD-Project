# CLO-PLO Mapping Implementation

## Tổng quan

Đã triển khai thành công hệ thống quản lý mapping giữa Course Learning Outcomes (CLO) và Program Learning Outcomes (PLO).

## Files đã tạo

### 1. DTO Layer

- **CLOPLOMappingResponse.java**: DTO cho response của mapping API
- **CLOResponse.java** (updated): Thêm trường `ploMappings` để hiển thị danh sách PLO được map
- **PLOResponse.java** (updated): Thêm trường `totalMappedCLOs` và `cloMappings` để hiển thị coverage

### 2. Repository Layer

- **CLOPLOMappingRepository.java**: Repository với các query methods:
  - `findByClo_CloId(Long cloId)`: Tìm mappings theo CLO
  - `findByPlo_PloId(Long ploId)`: Tìm mappings theo PLO
  - `findBySyllabusId(Long syllabusId)`: Tìm mappings theo Syllabus
  - `findByProgramId(Long programId)`: Tìm mappings theo Program
  - `findByClo_CloIdAndPlo_PloId(Long cloId, Long ploId)`: Check duplicate
  - `countByPloId(Long ploId)`: Đếm số CLO được map với PLO
  - `getPLOCoverageByProgram(Long programId)`: Thống kê coverage

### 3. Service Layer

- **CLOPLOMappingService.java**: Service xử lý business logic:
  - CRUD operations cho mappings
  - Batch create mappings
  - Validation (duplicate check, mapping level validation)
  - Conversion từ Entity sang DTO
- **CLOService.java** (updated): Thêm method `getCLOWithMappings(Long id)`
- **PLOService.java** (updated): Thêm method `getPLOWithCoverage(Long id)`

### 4. Controller Layer

- **CLOPLOMappingController.java**: REST API controller với 12 endpoints
- **CLOController.java** (updated): Thêm endpoint `/api/clos/{id}/with-mappings`
- **PLOController.java** (updated): Thêm endpoint `/api/plos/{id}/with-coverage`

### 5. Documentation

- **CLO_PLO_MAPPING_API.md**: Tài liệu API chi tiết với examples
- **test-clo-plo-mapping.ps1**: PowerShell script để test APIs

## API Endpoints

### CLO-PLO Mapping Management

```
GET    /api/clo-plo-mappings                    - Lấy tất cả mappings
GET    /api/clo-plo-mappings/{id}               - Lấy mapping theo ID
GET    /api/clo-plo-mappings/clo/{cloId}        - Lấy mappings của CLO
GET    /api/clo-plo-mappings/plo/{ploId}        - Lấy mappings của PLO
GET    /api/clo-plo-mappings/syllabus/{id}      - Lấy mappings theo syllabus
GET    /api/clo-plo-mappings/program/{id}       - Lấy mappings theo program
POST   /api/clo-plo-mappings                    - Tạo mapping mới
POST   /api/clo-plo-mappings/batch              - Tạo nhiều mappings
PUT    /api/clo-plo-mappings/{id}               - Cập nhật mapping level
DELETE /api/clo-plo-mappings/{id}               - Xóa mapping
DELETE /api/clo-plo-mappings/clo/{cloId}        - Xóa tất cả mappings của CLO
DELETE /api/clo-plo-mappings/plo/{ploId}        - Xóa tất cả mappings của PLO
```

### Enhanced CLO & PLO Endpoints

```
GET    /api/clos/{id}/with-mappings             - CLO kèm theo PLO mappings
GET    /api/plos/{id}/with-coverage             - PLO kèm theo coverage stats
```

## Mapping Levels

- **LOW**: Mức độ liên quan thấp
- **MEDIUM**: Mức độ liên quan trung bình
- **HIGH**: Mức độ liên quan cao

## Features

### 1. CRUD Operations

- Tạo, đọc, cập nhật, xóa mappings
- Batch operations cho hiệu suất cao
- Cascade delete khi xóa CLO hoặc PLO

### 2. Query Capabilities

- Lọc mappings theo CLO, PLO, Syllabus, hoặc Program
- Đếm số lượng mappings
- Thống kê coverage

### 3. Validation

- ✅ Kiểm tra CLO và PLO tồn tại
- ✅ Ngăn chặn duplicate mappings
- ✅ Validate mapping level (LOW, MEDIUM, HIGH)
- ✅ Comprehensive error messages

### 4. Enhanced DTOs

- CLO response bao gồm danh sách PLOs được map
- PLO response bao gồm coverage statistics và danh sách CLOs

### 5. Logging

- Tất cả operations đều được log với SLF4J
- Track creation, updates, deletions

## Testing

### Chạy test script:

```powershell
cd scripts
.\test-clo-plo-mapping.ps1
```

### Manual Testing với curl:

1. **Tạo mapping:**

```bash
curl -X POST http://localhost:8080/api/clo-plo-mappings \
  -H "Content-Type: application/json" \
  -d '{
    "cloId": 1,
    "ploId": 1,
    "mappingLevel": "HIGH"
  }'
```

2. **Lấy mappings của syllabus:**

```bash
curl http://localhost:8080/api/clo-plo-mappings/syllabus/1
```

3. **Tạo batch mappings:**

```bash
curl -X POST http://localhost:8080/api/clo-plo-mappings/batch \
  -H "Content-Type: application/json" \
  -d '{
    "cloId": 1,
    "ploIds": [1, 2, 3],
    "mappingLevel": "MEDIUM"
  }'
```

4. **Lấy CLO với mappings:**

```bash
curl http://localhost:8080/api/clos/1/with-mappings
```

5. **Lấy PLO với coverage:**

```bash
curl http://localhost:8080/api/plos/1/with-coverage
```

## Integration với Frontend

### TypeScript Service Example:

```typescript
// services/cloploMappingService.ts
import axiosClient from "./axiosClient";

export const cloploMappingService = {
  // Get all mappings
  getAllMappings: () => axiosClient.get("/clo-plo-mappings"),

  // Get mappings by syllabus
  getMappingsBySyllabusId: (syllabusId: number) =>
    axiosClient.get(`/clo-plo-mappings/syllabus/${syllabusId}`),

  // Create single mapping
  createMapping: (cloId: number, ploId: number, mappingLevel: string) =>
    axiosClient.post("/clo-plo-mappings", { cloId, ploId, mappingLevel }),

  // Create batch mappings
  createBatchMappings: (
    cloId: number,
    ploIds: number[],
    mappingLevel: string,
  ) =>
    axiosClient.post("/clo-plo-mappings/batch", {
      cloId,
      ploIds,
      mappingLevel,
    }),

  // Update mapping level
  updateMapping: (mappingId: number, mappingLevel: string) =>
    axiosClient.put(`/clo-plo-mappings/${mappingId}`, { mappingLevel }),

  // Delete mapping
  deleteMapping: (mappingId: number) =>
    axiosClient.delete(`/clo-plo-mappings/${mappingId}`),

  // Get CLO with mappings
  getCLOWithMappings: (cloId: number) =>
    axiosClient.get(`/clos/${cloId}/with-mappings`),

  // Get PLO with coverage
  getPLOWithCoverage: (ploId: number) =>
    axiosClient.get(`/plos/${ploId}/with-coverage`),
};
```

### React Component Example:

```tsx
// components/CLOPLOMapping.tsx
import React, { useState, useEffect } from "react";
import { cloploMappingService } from "../services/cloploMappingService";

export const CLOPLOMapping: React.FC<{ syllabusId: number }> = ({
  syllabusId,
}) => {
  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const response =
          await cloploMappingService.getMappingsBySyllabusId(syllabusId);
        setMappings(response.data);
      } catch (error) {
        console.error("Error fetching mappings:", error);
      }
    };

    fetchMappings();
  }, [syllabusId]);

  return (
    <div>
      <h3>CLO-PLO Mappings</h3>
      <table>
        <thead>
          <tr>
            <th>CLO Code</th>
            <th>PLO Code</th>
            <th>Mapping Level</th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((m) => (
            <tr key={m.mappingId}>
              <td>{m.cloCode}</td>
              <td>{m.ploCode}</td>
              <td>
                <span className={`badge badge-${m.mappingLevel.toLowerCase()}`}>
                  {m.mappingLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Database Schema

### Table: clo_plo_mapping

```sql
CREATE TABLE clo_plo_mapping (
    mapping_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clo_id BIGINT NOT NULL,
    plo_id BIGINT NOT NULL,
    mapping_level VARCHAR(20) NOT NULL,
    FOREIGN KEY (clo_id) REFERENCES clo(clo_id) ON DELETE CASCADE,
    FOREIGN KEY (plo_id) REFERENCES plo(plo_id) ON DELETE CASCADE,
    UNIQUE KEY unique_clo_plo (clo_id, plo_id)
);
```

## Next Steps

### 1. Frontend Integration

- [ ] Cập nhật CreateSyllabusPage để sử dụng API mới
- [ ] Cập nhật SyllabusApprovalDetailPage để hiển thị mappings
- [ ] Tạo component để visualize PLO coverage
- [ ] Thêm UI cho bulk mapping operations

### 2. Reporting Features

- [ ] Generate PLO coverage report by program
- [ ] Export mappings to Excel/PDF
- [ ] Visualize mapping matrix (CLO x PLO)
- [ ] Dashboard showing mapping statistics

### 3. AI Integration

- [ ] Integrate với AI service để suggest mappings
- [ ] Auto-validate mapping appropriateness
- [ ] Detect inconsistent mappings

### 4. Advanced Features

- [ ] Mapping weights/percentages
- [ ] Historical tracking of mapping changes
- [ ] Approval workflow for mappings
- [ ] Batch import/export functionality

## Swagger Documentation

Sau khi chạy ứng dụng, truy cập Swagger UI tại:

```
http://localhost:8080/swagger-ui.html
```

Tìm section "CLO-PLO Mapping" để xem và test tất cả endpoints.

## Build & Deploy

### Build application:

```bash
cd core-service/core-service
mvn clean package
```

### Run application:

```bash
java -jar target/smd-core-service.jar
```

### Docker build:

```bash
docker build -t smd-core-service:latest .
docker push tuanng205/smd-core-service:v7.1
```

## Troubleshooting

### Common Issues:

1. **Error: "Mapping already exists"**
   - Kiểm tra đã tồn tại mapping giữa CLO và PLO này chưa
   - Sử dụng PUT để update thay vì POST

2. **Error: "CLO/PLO not found"**
   - Đảm bảo CLO và PLO ID tồn tại trong database
   - Check foreign key constraints

3. **Error: "Invalid mapping level"**
   - Mapping level phải là: LOW, MEDIUM, hoặc HIGH (case-insensitive)

## Contributors

- Backend Team: CLO-PLO Mapping Implementation
- Date: January 30, 2026
