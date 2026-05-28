package Koul.Hell_Study.application.topic;

import Koul.Hell_Study.api.topic.dto.TopicRequest;
import Koul.Hell_Study.api.topic.dto.TopicResponse;
import Koul.Hell_Study.domain.course.Course;
import Koul.Hell_Study.domain.course.CourseRepository;
import Koul.Hell_Study.domain.enrollment.CourseEnrollmentRepository;
import Koul.Hell_Study.domain.enrollment.EnrollmentStatus;
import Koul.Hell_Study.domain.exception.ForbiddenException;
import Koul.Hell_Study.domain.topic.Topic;
import Koul.Hell_Study.domain.topic.TopicRepository;
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
public class TopicService {

    private final TopicRepository topicRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    // 코스+라운드별 발제 목록 조회 (수강 승인된 사용자 + Admin/SuperAdmin)
    public List<TopicResponse> getTopicsByCourseAndRound(Long courseId, int roundNumber, String loginId) {
        Course course = findCourse(courseId);
        validateCourseAccess(course, findUser(loginId));
        return topicRepository.findAllByCourseAndRoundNumberOrderByCreatedAtAsc(course, roundNumber).stream()
                .map(TopicResponse::from)
                .toList();
    }

    @Transactional
    public TopicResponse create(Long courseId, int roundNumber, TopicRequest request, String loginId) {
        Course course = findCourse(courseId);
        User author = findUser(loginId);

        if (author.getRole() != Role.SUPER_ADMIN && !course.isOwnedBy(author)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        Topic topic = Topic.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .course(course)
                .roundNumber(roundNumber)
                .author(author)
                .build();
        return TopicResponse.from(topicRepository.save(topic));
    }

    @Transactional
    public TopicResponse update(Long id, TopicRequest request, String loginId) {
        Topic topic = findById(id);
        validateOwnership(topic, findUser(loginId));
        topic.update(request.getTitle(), request.getContent());
        return TopicResponse.from(topic);
    }

    @Transactional
    public void delete(Long id, String loginId) {
        Topic topic = findById(id);
        validateOwnership(topic, findUser(loginId));
        topicRepository.delete(topic);
    }

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

    private void validateOwnership(Topic topic, User user) {
        if (user.getRole() != Role.SUPER_ADMIN && !topic.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }
    }

    private Topic findById(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 발제입니다."));
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
