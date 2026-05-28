package Koul.Hell_Study.application.assignment;

import Koul.Hell_Study.api.assignment.dto.AssignmentRequest;
import Koul.Hell_Study.api.assignment.dto.AssignmentResponse;
import Koul.Hell_Study.domain.assignment.Assignment;
import Koul.Hell_Study.domain.assignment.AssignmentRepository;
import Koul.Hell_Study.domain.course.Course;
import Koul.Hell_Study.domain.course.CourseRepository;
import Koul.Hell_Study.domain.enrollment.CourseEnrollmentRepository;
import Koul.Hell_Study.domain.enrollment.EnrollmentStatus;
import Koul.Hell_Study.domain.exception.ForbiddenException;
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
    private final CourseEnrollmentRepository enrollmentRepository;

    public List<AssignmentResponse> getAssignmentsByCourse(Long courseId, String loginId) {
        Course course = findCourse(courseId);
        validateCourseAccess(course, findUser(loginId));
        return assignmentRepository.findAllByCourse(course).stream()
                .map(AssignmentResponse::from)
                .toList();
    }

    public List<AssignmentResponse> getAssignmentsByRound(Long courseId, int roundNumber, String loginId) {
        Course course = findCourse(courseId);
        validateCourseAccess(course, findUser(loginId));
        return assignmentRepository.findAllByCourseAndRoundNumber(course, roundNumber).stream()
                .map(AssignmentResponse::from)
                .toList();
    }

    public AssignmentResponse getAssignment(Long id, String loginId) {
        Assignment assignment = findById(id);
        validateCourseAccess(assignment.getCourse(), findUser(loginId));
        return AssignmentResponse.from(assignment);
    }

    @Transactional
    public AssignmentResponse create(Long courseId, AssignmentRequest request, String loginId) {
        Course course = findCourse(courseId);
        User user = findUser(loginId);

        if (user.getRole() != Role.SUPER_ADMIN && !course.isOwnedBy(user)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        if (request.getRoundNumber() < 1 || request.getRoundNumber() > course.getTotalRounds()) {
            throw new IllegalArgumentException(
                "라운드 번호는 1 이상 " + course.getTotalRounds() + " 이하여야 합니다.");
        }

        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .roundNumber(request.getRoundNumber())
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

    // SUPER_ADMIN, 코스 소유자, APPROVED 수강자만 접근 허용
    private void validateCourseAccess(Course course, User user) {
        if (user.getRole() == Role.SUPER_ADMIN) return;
        if (course.isOwnedBy(user)) return;

        enrollmentRepository.findByCourseAndApplicant(course, user).ifPresentOrElse(
            enrollment -> {
                switch (enrollment.getStatus()) {
                    case APPROVED -> { /* 허용 */ }
                    case PENDING -> throw new ForbiddenException("수강 신청이 승인 대기 중입니다.");
                    case REJECTED -> throw new ForbiddenException("수강 신청이 거절되었습니다.");
                }
            },
            () -> { throw new ForbiddenException("수강 신청이 필요합니다."); }
        );
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
