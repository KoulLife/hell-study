package Koul.Hell_Study.application.assignment;

import Koul.Hell_Study.api.assignment.dto.AssignmentRequest;
import Koul.Hell_Study.api.assignment.dto.AssignmentResponse;
import Koul.Hell_Study.domain.assignment.Assignment;
import Koul.Hell_Study.domain.assignment.AssignmentRepository;
import Koul.Hell_Study.domain.course.Course;
import Koul.Hell_Study.domain.course.CourseRepository;
import Koul.Hell_Study.domain.user.Role;
import Koul.Hell_Study.domain.user.User;
import Koul.Hell_Study.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public List<AssignmentResponse> getAssignmentsByCourse(Long courseId) {
        Course course = findCourse(courseId);
        return assignmentRepository.findAllByCourse(course).stream()
                .map(AssignmentResponse::from)
                .toList();
    }

    public AssignmentResponse getAssignment(Long id) {
        return AssignmentResponse.from(findById(id));
    }

    @Transactional
    public AssignmentResponse create(Long courseId, AssignmentRequest request, String loginId) {
        Course course = findCourse(courseId);
        User user = findUser(loginId);

        // Admin은 자신이 개설한 코스에만 과제 추가 가능
        if (user.getRole() != Role.SUPER_ADMIN && !course.isOwnedBy(user)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .course(course)
                .createdBy(user)
                .build();
        return AssignmentResponse.from(assignmentRepository.save(assignment));
    }

    @Transactional
    public AssignmentResponse update(Long id, AssignmentRequest request, String loginId) {
        Assignment assignment = findById(id);
        validateOwnership(assignment, findUser(loginId));
        assignment.update(request.getTitle(), request.getDescription(), request.getDeadline());
        return AssignmentResponse.from(assignment);
    }

    @Transactional
    public void delete(Long id, String loginId) {
        Assignment assignment = findById(id);
        validateOwnership(assignment, findUser(loginId));
        assignmentRepository.delete(assignment);
    }

    private void validateOwnership(Assignment assignment, User user) {
        if (user.getRole() != Role.SUPER_ADMIN && !assignment.isOwnedBy(user)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }
    }

    private Assignment findById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 과제입니다."));
    }

    private Course findCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코스입니다."));
    }

    private User findUser(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));
    }
}
