package com.smd.core.service;

import com.smd.core.dto.CourseSimpleDto;
import com.smd.core.entity.Course;
import com.smd.core.entity.CourseSubscription;
import com.smd.core.entity.User;
import com.smd.core.exception.DuplicateResourceException;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.CourseRepository;
import com.smd.core.repository.CourseSubscriptionRepository;
import com.smd.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseSubscriptionService {

    private final CourseSubscriptionRepository subscriptionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional
    public void followCourse(String username, Long courseId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (subscriptionRepository.existsByUser_UserIdAndCourse_CourseId(user.getUserId(), courseId)) {
            throw new DuplicateResourceException("You are already following this course");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        CourseSubscription subscription = CourseSubscription.builder()
                .user(user)
                .course(course)
                .build();

        subscriptionRepository.save(subscription);
    }

    @Transactional
    public void unfollowCourse(String username, Long courseId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CourseSubscription subscription = subscriptionRepository
                .findByUser_UserIdAndCourse_CourseId(user.getUserId(), courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        subscriptionRepository.delete(subscription);
    }

    @Transactional(readOnly = true)
    public List<CourseSimpleDto> getFollowedCourses(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Reuse CourseSimpleDto exist in your project
        return subscriptionRepository.findByUser_UserId(user.getUserId()).stream()
                .map(sub -> {
                    Course c = sub.getCourse();
                    return CourseSimpleDto.builder() // Giả sử bạn có builder này
                            .courseId(c.getCourseId())
                            .courseCode(c.getCourseCode())
                            .courseName(c.getCourseName())
                            .build();
                })
                .collect(Collectors.toList());
    }
}