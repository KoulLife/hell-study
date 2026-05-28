package Koul.Hell_Study.domain.enrollment;

import Koul.Hell_Study.domain.course.Course;
import Koul.Hell_Study.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    List<CourseEnrollment> findAllByCourse(Course course);

    Optional<CourseEnrollment> findByCourseAndApplicant(Course course, User applicant);

    boolean existsByCourseAndApplicantAndStatusIn(Course course, User applicant, List<EnrollmentStatus> statuses);

    boolean existsByCourseAndApplicantAndStatus(Course course, User applicant, EnrollmentStatus status);

    List<CourseEnrollment> findAllByApplicant(User applicant);
}
