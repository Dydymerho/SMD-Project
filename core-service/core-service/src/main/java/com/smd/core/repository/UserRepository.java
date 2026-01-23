package com.smd.core.repository;

import com.smd.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);
    
    /**
     * Find users by role name
     * @param roleName The role name to search for
     * @return List of users with the specified role
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.userRoles ur JOIN ur.role r WHERE r.roleName = :roleName")
    List<User> findByRole_RoleName(@Param("roleName") String roleName);
}
