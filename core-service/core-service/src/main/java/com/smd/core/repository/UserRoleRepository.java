package com.smd.core.repository;

import com.smd.core.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    List<UserRole> findByUser_UserId(Long userId);
    
    Optional<UserRole> findByUser_UserIdAndRole_RoleId(Long userId, Long roleId);
    
    void deleteByUser_UserIdAndRole_RoleId(Long userId, Long roleId);
}
