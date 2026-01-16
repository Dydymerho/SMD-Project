-- =========================================================
-- AUDIT LOG RETENTION AND ARCHIVING MANAGEMENT
-- =========================================================
-- This script provides utilities for managing audit log data
-- including archiving old logs and managing table size

-- =========================================================
-- 1. ARCHIVING OLD AUDIT LOGS
-- =========================================================

-- Create archive table for old audit logs (older than 2 years)
CREATE TABLE IF NOT EXISTS syllabus_audit_logs_archive (
    LIKE syllabus_audit_logs INCLUDING ALL
);

-- Function to archive old logs
CREATE OR REPLACE FUNCTION archive_old_audit_logs(months_old INTEGER DEFAULT 24)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Move logs older than specified months to archive table
    WITH archived AS (
        INSERT INTO syllabus_audit_logs_archive
        SELECT * FROM syllabus_audit_logs
        WHERE timestamp < CURRENT_TIMESTAMP - (months_old || ' months')::INTERVAL
        RETURNING id
    )
    DELETE FROM syllabus_audit_logs
    WHERE id IN (SELECT id FROM archived)
    RETURNING id INTO archived_count;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Example: Archive logs older than 24 months
-- SELECT archive_old_audit_logs(24);

-- =========================================================
-- 2. STATISTICS AND MONITORING
-- =========================================================

-- View: Audit log statistics by month
CREATE OR REPLACE VIEW audit_log_stats_monthly AS
SELECT 
    TO_CHAR(timestamp, 'YYYY-MM') AS month,
    COUNT(*) AS total_logs,
    COUNT(DISTINCT syllabus_id) AS unique_syllabuses,
    COUNT(DISTINCT performed_by) AS unique_users,
    COUNT(CASE WHEN action_type LIKE '%APPROVE%' THEN 1 END) AS approval_actions,
    COUNT(CASE WHEN action_type LIKE '%REJECT%' THEN 1 END) AS rejection_actions,
    pg_size_pretty(
        COUNT(*) * (
            SELECT pg_column_size(t.*)::bigint 
            FROM syllabus_audit_logs t 
            LIMIT 1
        )
    ) AS estimated_size
FROM syllabus_audit_logs
GROUP BY month
ORDER BY month DESC;

-- View: Current table size and statistics
CREATE OR REPLACE VIEW audit_log_table_info AS
SELECT 
    (SELECT COUNT(*) FROM syllabus_audit_logs) AS total_records,
    (SELECT COUNT(*) FROM syllabus_audit_logs_archive) AS archived_records,
    pg_size_pretty(pg_total_relation_size('syllabus_audit_logs')) AS table_size,
    pg_size_pretty(pg_total_relation_size('syllabus_audit_logs_archive')) AS archive_size,
    (SELECT MIN(timestamp) FROM syllabus_audit_logs) AS oldest_log,
    (SELECT MAX(timestamp) FROM syllabus_audit_logs) AS newest_log,
    (SELECT AVG(pg_column_size(t.*))::integer FROM syllabus_audit_logs t LIMIT 1000) AS avg_row_size_bytes;

-- View: Top users by activity
CREATE OR REPLACE VIEW audit_log_top_users AS
SELECT 
    performed_by,
    performed_by_role,
    COUNT(*) AS total_actions,
    COUNT(DISTINCT syllabus_id) AS syllabuses_touched,
    MIN(timestamp) AS first_action,
    MAX(timestamp) AS last_action,
    COUNT(CASE WHEN timestamp >= CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) AS actions_last_7_days
FROM syllabus_audit_logs
GROUP BY performed_by, performed_by_role
ORDER BY total_actions DESC;

-- View: Action type distribution
CREATE OR REPLACE VIEW audit_log_action_distribution AS
SELECT 
    action_type,
    COUNT(*) AS count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) AS percentage,
    COUNT(DISTINCT performed_by) AS unique_users,
    MIN(timestamp) AS first_occurrence,
    MAX(timestamp) AS last_occurrence
FROM syllabus_audit_logs
GROUP BY action_type
ORDER BY count DESC;

-- =========================================================
-- 3. DATA RETENTION POLICY
-- =========================================================

-- Function to check if cleanup is needed
CREATE OR REPLACE FUNCTION check_audit_log_cleanup_needed()
RETURNS TABLE(
    total_records BIGINT,
    table_size TEXT,
    oldest_log TIMESTAMP,
    days_old INTEGER,
    cleanup_recommended BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) AS total_records,
        pg_size_pretty(pg_total_relation_size('syllabus_audit_logs')) AS table_size,
        MIN(timestamp) AS oldest_log,
        EXTRACT(DAY FROM (CURRENT_TIMESTAMP - MIN(timestamp)))::INTEGER AS days_old,
        (pg_total_relation_size('syllabus_audit_logs') > 1073741824 OR -- > 1GB
         EXTRACT(DAY FROM (CURRENT_TIMESTAMP - MIN(timestamp))) > 730) AS cleanup_recommended -- > 2 years
    FROM syllabus_audit_logs;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 4. BACKUP AND EXPORT
-- =========================================================

-- Function to export audit logs to JSON for backup
CREATE OR REPLACE FUNCTION export_audit_logs_json(
    start_date TIMESTAMP DEFAULT NULL,
    end_date TIMESTAMP DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT json_agg(row_to_json(t))::TEXT INTO result
    FROM (
        SELECT 
            id,
            syllabus_id,
            action_type,
            performed_by,
            performed_by_role,
            old_status,
            new_status,
            comments,
            ip_address,
            timestamp,
            additional_data
        FROM syllabus_audit_logs
        WHERE (start_date IS NULL OR timestamp >= start_date)
          AND (end_date IS NULL OR timestamp <= end_date)
        ORDER BY timestamp
    ) t;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Example: Export last month's logs
-- SELECT export_audit_logs_json(
--     CURRENT_TIMESTAMP - INTERVAL '1 month',
--     CURRENT_TIMESTAMP
-- );

-- =========================================================
-- 5. CLEANUP AND MAINTENANCE
-- =========================================================

-- Function to vacuum and analyze audit log table
CREATE OR REPLACE FUNCTION maintain_audit_log_table()
RETURNS VOID AS $$
BEGIN
    VACUUM ANALYZE syllabus_audit_logs;
    VACUUM ANALYZE syllabus_audit_logs_archive;
    REINDEX TABLE syllabus_audit_logs;
    REINDEX TABLE syllabus_audit_logs_archive;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 6. ORPHANED LOGS MANAGEMENT
-- =========================================================

-- View: Audit logs for deleted syllabuses
CREATE OR REPLACE VIEW audit_log_orphaned AS
SELECT 
    COUNT(*) AS total_orphaned_logs,
    COUNT(DISTINCT syllabus_id) AS deleted_syllabuses,
    MIN(timestamp) AS oldest_orphaned,
    MAX(timestamp) AS newest_orphaned,
    pg_size_pretty(
        COUNT(*) * (SELECT AVG(pg_column_size(t.*))::bigint FROM syllabus_audit_logs t LIMIT 100)
    ) AS estimated_size
FROM syllabus_audit_logs
WHERE syllabus_id IS NULL OR syllabus_id NOT IN (SELECT syllabus_id FROM syllabus);

-- Function to export orphaned logs before cleanup
CREATE OR REPLACE FUNCTION export_orphaned_audit_logs()
RETURNS TABLE(
    id BIGINT,
    syllabus_id BIGINT,
    action_type VARCHAR,
    performed_by VARCHAR,
    timestamp TIMESTAMP,
    comments TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.syllabus_id,
        a.action_type,
        a.performed_by,
        a.timestamp,
        a.comments
    FROM syllabus_audit_logs a
    WHERE a.syllabus_id IS NULL 
       OR a.syllabus_id NOT IN (SELECT s.syllabus_id FROM syllabus s);
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 7. SCHEDULED MAINTENANCE (To be run via cron or pg_cron)
-- =========================================================

-- Example maintenance schedule:
-- Daily: VACUUM ANALYZE
-- Weekly: Check cleanup needs
-- Monthly: Archive old logs (>24 months)
-- Quarterly: REINDEX

-- To use with pg_cron extension:
-- SELECT cron.schedule('audit-log-daily-maintenance', '0 2 * * *', 
--     'VACUUM ANALYZE syllabus_audit_logs');

-- =========================================================
-- USAGE EXAMPLES
-- =========================================================

-- Check current statistics
-- SELECT * FROM audit_log_table_info;

-- Check if cleanup is needed
-- SELECT * FROM check_audit_log_cleanup_needed();

-- View monthly statistics
-- SELECT * FROM audit_log_stats_monthly LIMIT 12;

-- View top active users
-- SELECT * FROM audit_log_top_users LIMIT 20;

-- View action distribution
-- SELECT * FROM audit_log_action_distribution;

-- Check orphaned logs
-- SELECT * FROM audit_log_orphaned;

-- Archive old logs (older than 24 months)
-- SELECT archive_old_audit_logs(24);

-- Run maintenance
-- SELECT maintain_audit_log_table();

-- Export logs for backup
-- \o /tmp/audit_logs_backup.json
-- SELECT export_audit_logs_json('2025-01-01', '2025-12-31');
-- \o
