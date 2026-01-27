package com.smd.core.repository;

import com.smd.core.entity.CourseSubscription;
import com.smd.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseSubscriptionRepository extends JpaRepository<CourseSubscription, Long> {
    // Kiểm tra đã follow chưa
    boolean existsByUser_UserIdAndCourse_CourseId(Long userId, Long courseId);

    // Tìm record để xóa (unfollow)
    Optional<CourseSubscription> findByUser_UserIdAndCourse_CourseId(Long userId, Long courseId);

    // Lấy danh sách các môn user đang follow
    List<CourseSubscription> findByUser_UserId(Long userId);

    // Lấy danh sách users đang follow một môn học (Dùng để gửi thông báo)
    @Query("SELECT cs.user FROM CourseSubscription cs WHERE cs.course.courseId = :courseId")
    List<User> findFollowersByCourseId(Long courseId);
}