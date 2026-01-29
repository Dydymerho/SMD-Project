package com.smd.core.entity;

/**
 * Enum representing the context type where a comment is attached
 */
public enum CommentContextType {
    /**
     * General comment on the entire syllabus
     */
    SYLLABUS_GENERAL,
    
    /**
     * Comment on a specific Course Learning Outcome (CLO)
     */
    CLO,
    
    /**
     * Comment on a specific Program Learning Outcome (PLO)
     */
    PLO,
    
    /**
     * Comment on a specific Assessment
     */
    ASSESSMENT,
    
    /**
     * Comment on a specific Material/Reference
     */
    MATERIAL,
    
    /**
     * Comment on a specific Session Plan/Weekly schedule
     */
    SESSION_PLAN
}
