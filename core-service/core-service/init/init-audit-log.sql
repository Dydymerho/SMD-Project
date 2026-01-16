
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_syllabus_id ON syllabus_audit_logs(syllabus_id);
CREATE INDEX IF NOT EXISTS idx_audit_performed_by ON syllabus_audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_action_type ON syllabus_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON syllabus_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_syllabus_timestamp ON syllabus_audit_logs(syllabus_id, timestamp);

-- Add comments to table and columns
COMMENT ON TABLE syllabus_audit_logs IS 'Audit log table to track all syllabus operations and changes';
COMMENT ON COLUMN syllabus_audit_logs.syllabus_id IS 'Reference to the syllabus that was modified';
COMMENT ON COLUMN syllabus_audit_logs.action_type IS 'Type of action performed (CREATE, UPDATE, SUBMIT, APPROVE, REJECT, etc.)';
COMMENT ON COLUMN syllabus_audit_logs.performed_by IS 'Username of the user who performed the action';
COMMENT ON COLUMN syllabus_audit_logs.performed_by_role IS 'Role of the user at the time of action (LECTURER, HOD, AA, PRINCIPAL)';
COMMENT ON COLUMN syllabus_audit_logs.old_status IS 'Status before the action (for status change actions)';
COMMENT ON COLUMN syllabus_audit_logs.new_status IS 'Status after the action (for status change actions)';
COMMENT ON COLUMN syllabus_audit_logs.comments IS 'User comments or notes about the action';
COMMENT ON COLUMN syllabus_audit_logs.changed_fields IS 'JSON string of changed fields and their values';
COMMENT ON COLUMN syllabus_audit_logs.ip_address IS 'IP address of the client that made the request';
COMMENT ON COLUMN syllabus_audit_logs.user_agent IS 'Browser/client user agent string';
COMMENT ON COLUMN syllabus_audit_logs.timestamp IS 'Timestamp when the action was performed';
COMMENT ON COLUMN syllabus_audit_logs.additional_data IS 'Additional JSON data specific to the action type';

-- Grant permissions (adjust according to your database user setup)
-- GRANT SELECT, INSERT ON syllabus_audit_logs TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE syllabus_audit_logs_id_seq TO your_app_user;

-- Example queries to verify the table

-- Get all audit logs for a specific syllabus
-- SELECT * FROM syllabus_audit_logs WHERE syllabus_id = 1 ORDER BY timestamp DESC;

-- Get workflow history for a syllabus
-- SELECT * FROM syllabus_audit_logs 
-- WHERE syllabus_id = 1 
--   AND (action_type LIKE '%SUBMIT%' OR action_type LIKE '%APPROVE%' OR action_type LIKE '%REJECT%')
-- ORDER BY timestamp ASC;

-- Get all actions by a specific user
-- SELECT * FROM syllabus_audit_logs WHERE performed_by = 'lecturer1' ORDER BY timestamp DESC;

-- Get recent audit logs (last 7 days)
-- SELECT * FROM syllabus_audit_logs 
-- WHERE timestamp >= CURRENT_TIMESTAMP - INTERVAL '7 days'
-- ORDER BY timestamp DESC;
