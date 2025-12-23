package com.smd.core.service;

import com.smd.core.entity.Course;
import com.smd.core.exception.DuplicateResourceException;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.CourseRepository;
import com.smd.core.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Course getCourseByCourseCode(String courseCode) {
        return courseRepository.findByCourseCode(courseCode)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with code: " + courseCode));
    }

    @Transactional
    public Course createCourse(Course course) {
        if (courseRepository.existsByCourseCode(course.getCourseCode())) {
            throw new DuplicateResourceException("Course already exists with code: " + course.getCourseCode());
        }
        
        if (course.getDepartment() != null && course.getDepartment().getDepartmentId() != null) {
            departmentRepository.findById(course.getDepartment().getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        }
        
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long id, Course courseDetails) {
        Course course = getCourseById(id);
        
        // Check if course code is being changed and if the new code already exists
        if (!course.getCourseCode().equals(courseDetails.getCourseCode()) &&
                courseRepository.existsByCourseCode(courseDetails.getCourseCode())) {
            throw new DuplicateResourceException("Course already exists with code: " + courseDetails.getCourseCode());
        }
        
        course.setCourseCode(courseDetails.getCourseCode());
        course.setCourseName(courseDetails.getCourseName());
        course.setCredits(courseDetails.getCredits());
        
        if (courseDetails.getDepartment() != null && courseDetails.getDepartment().getDepartmentId() != null) {
            departmentRepository.findById(courseDetails.getDepartment().getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            course.setDepartment(courseDetails.getDepartment());
        }
        
        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
    }
}
