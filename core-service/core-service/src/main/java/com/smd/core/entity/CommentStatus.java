package com.smd.core.entity;

/**
 * Enum representing the status of a review comment
 */
public enum CommentStatus {
    /**
     * Comment is open and awaiting resolution
     */
    OPEN,
    
    /**
     * Comment has been resolved/addressed
     */
    RESOLVED,
    
    /**
     * Comment is closed (no action needed)
     */
    CLOSED
}
