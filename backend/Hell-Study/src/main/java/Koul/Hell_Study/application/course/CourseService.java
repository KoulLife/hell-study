package Koul.Hell_Study.application.course;

import Koul.Hell_Study.api.course.dto.CourseRequest;
import Koul.Hell_Study.api.course.dto.CourseResponse;
import Koul.Hell_Study.domain.assignment.Assignment;
import Koul.Hell_Study.domain.assignment.AssignmentRepository;
import Koul.Hell_Study.domain.course.Course;
import Koul.Hell_Study.domain.course.CourseRepository;
import Koul.Hell_Study.domain.submission.SubmissionRepository;
import Koul.Hell_Study.domain.submission.SubmissionStatus;
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
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    public List<CourseResponse> getCourses() {
        return courseRepository.findAll().stream()
                .map(CourseResponse::from)
                .toList();
    }

    public CourseResponse getCourse(Long id) {
        return CourseResponse.from(findById(id));
    }

    @Transactional
    public CourseResponse create(CourseRequest request, String loginId) {
        User user = findUser(loginId);
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .totalRounds(request.getTotalRounds())
                .createdBy(user)
                .build();
        return CourseResponse.from(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest request, String loginId) {
        Course course = findById(id);
        validateOwnership(course, findUser(loginId));
        course.update(request.getTitle(), request.getDescription(), request.getTotalRounds());
        return CourseResponse.from(course);
    }

    @Transactional
    public CourseResponse completeRound(Long id, String loginId) {
        Course course = findById(id);
        validateOwnership(course, findUser(loginId));

        int targetRound = course.getCompletedRounds() + 1;
        List<Assignment> roundAssignments = assignmentRepository.findAllByCourseAndRoundNumber(course, targetRound);

        if (!roundAssignments.isEmpty()) {
            boolean hasUnevaluated = submissionRepository
                    .existsByAssignmentInAndStatus(roundAssignments, SubmissionStatus.SUBMITTED);
            if (hasUnevaluated) {
                throw new IllegalStateException(
                    targetRound + "라운드에 아직 평가되지 않은 제출이 있어 라운드를 종료할 수 없습니다.");
            }
            roundAssignments.forEach(Assignment::close);
        }

        course.completeRound();
        return CourseResponse.from(course);
    }

    @Transactional
    public void delete(Long id, String loginId) {
        Course course = findById(id);
        validateOwnership(course, findUser(loginId));
        courseRepository.delete(course);
    }

    // SuperAdmin은 모든 코스, Admin은 자신이 개설한 코스만
    private void validateOwnership(Course course, User user) {
        if (user.getRole() != Role.SUPER_ADMIN && !course.isOwnedBy(user)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }
    }

    private Course findById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코스입니다."));
    }

    private User findUser(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));
    }
}
