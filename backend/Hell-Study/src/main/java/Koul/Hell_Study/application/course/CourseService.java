package Koul.Hell_Study.application.course;

import Koul.Hell_Study.api.course.dto.CourseRequest;
import Koul.Hell_Study.api.course.dto.CourseResponse;
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
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

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
