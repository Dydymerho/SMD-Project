-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    syllabus_id BIGINT REFERENCES syllabuses(syllabus_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    triggered_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_syllabus_id ON notifications(syllabus_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Composite index for common queries
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Add check constraint for notification type
ALTER TABLE notifications 
ADD CONSTRAINT chk_notification_type 
CHECK (type IN (
    'SYLLABUS_SUBMITTED',
    'SYLLABUS_APPROVED_BY_HOD',
    'SYLLABUS_REJECTED_BY_HOD',
    'SYLLABUS_APPROVED_BY_AA',
    'SYLLABUS_REJECTED_BY_AA',
    'SYLLABUS_PUBLISHED',
    'SYLLABUS_REJECTED_BY_PRINCIPAL',
    'PDF_UPLOADED',
    'PDF_DELETED',
    'COMMENT_ADDED',
    'DEADLINE_REMINDER'
));

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'Stores user notifications for syllabus workflow events';
COMMENT ON COLUMN notifications.notification_id IS 'Primary key for notifications';
COMMENT ON COLUMN notifications.user_id IS 'Reference to the user who receives the notification';
COMMENT ON COLUMN notifications.syllabus_id IS 'Reference to the related syllabus (optional)';
COMMENT ON COLUMN notifications.type IS 'Type of notification event';
COMMENT ON COLUMN notifications.title IS 'Notification title';
COMMENT ON COLUMN notifications.message IS 'Detailed notification message';
COMMENT ON COLUMN notifications.is_read IS 'Whether the notification has been read';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when notification was marked as read';
COMMENT ON COLUMN notifications.action_url IS 'URL to navigate when notification is clicked';
COMMENT ON COLUMN notifications.triggered_by IS 'Username of the person who triggered the notification';
COMMENT ON COLUMN notifications.created_at IS 'Timestamp when notification was created';
