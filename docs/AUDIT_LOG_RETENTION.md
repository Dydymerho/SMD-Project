# Audit Log Data Retention and Storage Policy

## 📊 Tổng quan lưu trữ

### Nơi lưu trữ

- **Database**: PostgreSQL
- **Table chính**: `syllabus_audit_logs`
- **Table archive**: `syllabus_audit_logs_archive` (cho logs > 2 năm)
- **Backup**: Định kỳ export sang JSON/CSV

### Chính sách lưu giữ dữ liệu

```
┌─────────────────────────────────────────────────┐
│         AUDIT LOG RETENTION TIMELINE            │
├─────────────────────────────────────────────────┤
│ 0-6 tháng:   Active table, query nhanh         │
│ 6-24 tháng:  Active table, indexed             │
│ 24+ tháng:   Archive table (cold storage)      │
│ 5+ năm:      Backup offline, có thể xóa        │
└─────────────────────────────────────────────────┘
```

## 🔒 Bảo vệ dữ liệu Audit Log

### 1. Audit logs KHÔNG bị xóa khi xóa Syllabus

**Quan trọng**: Đã thay đổi từ `ON DELETE CASCADE` sang `ON DELETE SET NULL`

```sql
-- CŨ (SAI): Xóa audit logs khi xóa syllabus ❌
ON DELETE CASCADE

-- MỚI (ĐÚNG): Giữ audit logs, chỉ set syllabus_id = NULL ✅
ON DELETE SET NULL
```

**Lý do**:

- ✅ Tuân thủ compliance requirements
- ✅ Giữ lại bằng chứng pháp lý
- ✅ Audit trail không bao giờ bị mất
- ✅ Có thể điều tra sau khi xóa data

### 2. Orphaned Logs (Logs mồ côi)

Logs có `syllabus_id = NULL` là logs của các syllabus đã bị xóa:

```sql
-- Xem tất cả orphaned logs
SELECT * FROM audit_log_orphaned;

-- Kết quả mẫu:
-- total_orphaned_logs: 1,245
-- deleted_syllabuses: 15
-- oldest_orphaned: 2024-03-15
-- estimated_size: 2.1 MB
```

**Xử lý**: KHÔNG xóa, giữ lại để audit

## 📈 Monitoring và Statistics

### 1. Kiểm tra trạng thái table

```sql
-- Thông tin tổng quan
SELECT * FROM audit_log_table_info;

-- Kết quả:
-- total_records: 125,430
-- archived_records: 45,200
-- table_size: 156 MB
-- archive_size: 52 MB
-- oldest_log: 2023-01-15
-- newest_log: 2026-01-16
```

### 2. Thống kê theo tháng

```sql
-- Xem 12 tháng gần nhất
SELECT * FROM audit_log_stats_monthly LIMIT 12;
```

### 3. Top users hoạt động nhiều

```sql
-- Top 20 users
SELECT * FROM audit_log_top_users LIMIT 20;
```

### 4. Phân bố loại action

```sql
SELECT * FROM audit_log_action_distribution;
```

## 🗄️ Archiving Strategy

### Khi nào cần archive?

Chạy function để kiểm tra:

```sql
SELECT * FROM check_audit_log_cleanup_needed();

-- Kết quả:
-- total_records: 500,000
-- table_size: 650 MB
-- oldest_log: 2022-01-01
-- days_old: 1,476
-- cleanup_recommended: TRUE  ← Cần archive!
```

### Archive logs > 24 tháng

```sql
-- Archive logs cũ hơn 24 tháng
SELECT archive_old_audit_logs(24);

-- Kết quả: 45,200 logs đã được archive
```

**Lưu ý**:

- Logs được **MOVE** từ `syllabus_audit_logs` sang `syllabus_audit_logs_archive`
- Vẫn có thể query từ archive table
- Performance tốt hơn vì main table nhỏ hơn

## 💾 Backup Strategy

### 1. Export to JSON

```sql
-- Export tất cả logs
SELECT export_audit_logs_json();

-- Export theo khoảng thời gian
SELECT export_audit_logs_json(
    '2025-01-01'::TIMESTAMP,
    '2025-12-31'::TIMESTAMP
);
```

### 2. Export to file (psql)

```bash
# Export to JSON file
psql -U username -d database -c "SELECT export_audit_logs_json('2025-01-01', '2025-12-31')" > audit_2025.json

# Export to CSV
psql -U username -d database -c "COPY (SELECT * FROM syllabus_audit_logs WHERE timestamp >= '2025-01-01') TO STDOUT CSV HEADER" > audit_2025.csv
```

### 3. Scheduled backups

**Khuyến nghị lịch backup**:

- **Daily**: Incremental backup (logs của ngày hôm trước)
- **Weekly**: Full backup table
- **Monthly**: Archive logs cũ > 24 tháng
- **Quarterly**: Verify backup integrity

## 🔧 Maintenance Tasks

### 1. Daily maintenance

```sql
-- Vacuum và analyze (tối ưu performance)
VACUUM ANALYZE syllabus_audit_logs;
```

### 2. Weekly maintenance

```sql
-- Check if cleanup needed
SELECT * FROM check_audit_log_cleanup_needed();

-- Vacuum và reindex
SELECT maintain_audit_log_table();
```

### 3. Monthly maintenance

```sql
-- Archive old logs
SELECT archive_old_audit_logs(24);

-- Export backup
SELECT export_audit_logs_json(
    CURRENT_TIMESTAMP - INTERVAL '1 month',
    CURRENT_TIMESTAMP
);
```

### 4. Setup automated maintenance (pg_cron)

```sql
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily vacuum at 2 AM
SELECT cron.schedule(
    'audit-log-daily-vacuum',
    '0 2 * * *',
    'VACUUM ANALYZE syllabus_audit_logs'
);

-- Monthly archive at 3 AM on 1st day
SELECT cron.schedule(
    'audit-log-monthly-archive',
    '0 3 1 * *',
    'SELECT archive_old_audit_logs(24)'
);

-- Weekly reindex at 3 AM Sunday
SELECT cron.schedule(
    'audit-log-weekly-reindex',
    '0 3 * * 0',
    'REINDEX TABLE syllabus_audit_logs'
);
```

## 📊 Storage Estimation

### Tính toán dung lượng

**Giả định**:

- 1 audit log ≈ 500 bytes (average)
- 1,000 users, mỗi user 10 actions/tháng
- 10,000 actions/tháng
- 120,000 actions/năm

**Dung lượng theo thời gian**:

```
Year 1: 120,000 logs × 500 bytes = 60 MB
Year 2: 240,000 logs × 500 bytes = 120 MB
Year 3: 360,000 logs × 500 bytes = 180 MB
Year 5: 600,000 logs × 500 bytes = 300 MB
```

**Với archive strategy**:

- Main table: ~60-120 MB (1-2 năm data)
- Archive table: 120-180 MB (2-3 năm data)
- Total: ~300-400 MB sau 5 năm

## 🚨 Alerts và Monitoring

### Set up monitoring alerts

1. **Table size > 1 GB**: Cần archive
2. **Growth rate > 100 MB/month**: Review usage
3. **Query performance slow**: Cần reindex
4. **Backup failed**: Critical alert

### Query performance benchmarks

**Good performance**:

- Get logs by syllabus_id: < 100ms
- Get logs by user: < 200ms
- Get logs by date range: < 500ms

**If slower**: Run `SELECT maintain_audit_log_table()`

## 🔐 Security và Access Control

### Permissions

```sql
-- Read-only access for audit reviewers
GRANT SELECT ON syllabus_audit_logs TO audit_reviewer_role;
GRANT SELECT ON syllabus_audit_logs_archive TO audit_reviewer_role;

-- No DELETE permission for anyone except DBA
REVOKE DELETE ON syllabus_audit_logs FROM PUBLIC;
REVOKE DELETE ON syllabus_audit_logs_archive FROM PUBLIC;

-- App user: Only INSERT and SELECT
GRANT SELECT, INSERT ON syllabus_audit_logs TO app_user;
```

### Data privacy compliance

- **IP addresses**: Lưu trữ đúng quy định GDPR
- **User data**: Không lưu password hoặc sensitive data
- **Retention**: Tuân thủ legal requirements
- **Access logs**: Log ai đã query audit logs

## 📋 Best Practices

### ✅ DO

1. **Backup regularly** - Daily incremental, weekly full
2. **Monitor table size** - Set up alerts
3. **Archive old logs** - Move to archive table after 24 months
4. **Maintain indexes** - Vacuum and reindex regularly
5. **Review orphaned logs** - Understand why syllabuses were deleted
6. **Test restore** - Verify backups work

### ❌ DON'T

1. **Never DELETE audit logs** - Even if very old
2. **Don't ignore performance** - Archive if table > 1 GB
3. **Don't skip backups** - Critical for compliance
4. **Don't grant DELETE permission** - Protect audit integrity
5. **Don't truncate table** - Lose entire audit trail
6. **Don't modify historical logs** - Breaks audit integrity

## 🎯 Quick Reference Commands

```sql
-- Check status
SELECT * FROM audit_log_table_info;

-- Monthly stats
SELECT * FROM audit_log_stats_monthly LIMIT 12;

-- Top users
SELECT * FROM audit_log_top_users LIMIT 10;

-- Archive old logs
SELECT archive_old_audit_logs(24);

-- Maintain table
SELECT maintain_audit_log_table();

-- Export backup
SELECT export_audit_logs_json('2025-01-01', '2025-12-31');

-- Check orphaned
SELECT * FROM audit_log_orphaned;
```

## 📞 Troubleshooting

### Problem: Table quá lớn, query chậm

**Solution**:

```sql
-- 1. Archive old logs
SELECT archive_old_audit_logs(24);

-- 2. Reindex
SELECT maintain_audit_log_table();

-- 3. Verify indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'syllabus_audit_logs';
```

### Problem: Disk space đầy

**Solution**:

```sql
-- 1. Check current size
SELECT * FROM audit_log_table_info;

-- 2. Archive aggressively (even 12 months)
SELECT archive_old_audit_logs(12);

-- 3. Export and backup archive to external storage
-- 4. Consider dropping very old archive data (after backup)
```

### Problem: Orphaned logs quá nhiều

**Solution**:

```sql
-- 1. Review orphaned logs
SELECT * FROM audit_log_orphaned;

-- 2. Export for record
SELECT * FROM export_orphaned_audit_logs();

-- 3. Keep them! Don't delete (compliance)
-- 4. Archive to separate table if needed
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Maintained by**: SMD Development Team
