package com.smd.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long roleId;

    @Column(name = "role_name", nullable = false, unique = true)
    private String roleName;

    // Relationships
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnoreProperties({"role", "user"})
    private List<UserRole> userRoles;
    /*
    ADMIN
    LECTURER
    HEAD_OF_DEPARTMENT
    ACADEMIC_AFFAIRS
    PRINCIPAL
    STUDENT
    */
}
