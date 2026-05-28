package Koul.Hell_Study.application.enrollment;

import Koul.Hell_Study.api.enrollment.dto.EnrollmentResponse;
import Koul.Hell_Study.domain.course.Course;
import Koul.Hell_Study.domain.course.CourseRepository;
import Koul.Hell_Study.domain.enrollment.CourseEnrollment;
import Koul.Hell_Study.domain.enrollment.CourseEnrollmentRepository;
import Koul.Hell_Study.domain.enrollment.EnrollmentStatus;
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
public class CourseEnrollmentService {

    private final CourseEnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    // 코스 신청 — 코스 소유자는 신청 불가, 중복 신청(PENDING/APPROVED) 불가
    @Transactional
    public EnrollmentResponse apply(Long courseId, String loginId) {
        Course course = findCourse(courseId);
        User applicant = findUser(loginId);

        if (course.isOwnedBy(applicant)) {
            throw new IllegalArgumentException("자신이 개설한 코스에는 신청할 수 없습니다.");
        }

        boolean alreadyApplied = enrollmentRepository.existsByCourseAndApplicantAndStatusIn(
                course, applicant, List.of(EnrollmentStatus.PENDING, EnrollmentStatus.APPROVED));
        if (alreadyApplied) {
            throw new IllegalStateException("이미 신청하였거나 수락된 코스입니다.");
        }

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .course(course)
                .applicant(applicant)
                .build();
        return EnrollmentResponse.from(enrollmentRepository.save(enrollment));
    }

    // 내 수강신청 목록 조회
    public List<EnrollmentResponse> getMyEnrollments(String loginId) {
        User user = findUser(loginId);
        return enrollmentRepository.findAllByApplicant(user).stream()
                .map(EnrollmentResponse::from)
                .toList();
    }

    // 코스별 신청 목록 조회 — 코스 Admin 또는 SUPER_ADMIN
    public List<EnrollmentResponse> getEnrollments(Long courseId, String loginId) {
        Course course = findCourse(courseId);
        validateManageAuthority(course, findUser(loginId));
        return enrollmentRepository.findAllByCourse(course).stream()
                .map(EnrollmentResponse::from)
                .toList();
    }

    // 신청 수락 — 코스 Admin 또는 SUPER_ADMIN
    @Transactional
    public EnrollmentResponse approve(Long enrollmentId, String loginId) {
        CourseEnrollment enrollment = findEnrollment(enrollmentId);
        validateManageAuthority(enrollment.getCourse(), findUser(loginId));

        if (!enrollment.isPending()) {
            throw new IllegalStateException("대기 중인 신청만 수락할 수 있습니다.");
        }

        enrollment.approve();
        return EnrollmentResponse.from(enrollment);
    }

    // 신청 거절 — 코스 Admin 또는 SUPER_ADMIN
    @Transactional
    public EnrollmentResponse reject(Long enrollmentId, String loginId) {
        CourseEnrollment enrollment = findEnrollment(enrollmentId);
        validateManageAuthority(enrollment.getCourse(), findUser(loginId));

        if (!enrollment.isPending()) {
            throw new IllegalStateException("대기 중인 신청만 거절할 수 있습니다.");
        }

        enrollment.reject();
        return EnrollmentResponse.from(enrollment);
    }

    // SUPER_ADMIN은 모든 코스, ADMIN은 자신이 개설한 코스만 관리 가능
    private void validateManageAuthority(Course course, User user) {
        if (user.getRole() == Role.SUPER_ADMIN) return;
        if (user.getRole() == Role.ADMIN && course.isOwnedBy(user)) return;
        throw new IllegalArgumentException("접근 권한이 없습니다.");
    }

    private CourseEnrollment findEnrollment(Long enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신청입니다."));
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
