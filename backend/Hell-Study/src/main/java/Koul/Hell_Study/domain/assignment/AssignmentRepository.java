package Koul.Hell_Study.domain.assignment;

import Koul.Hell_Study.domain.course.Course;
import Koul.Hell_Study.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findAllByCourse(Course course);

    List<Assignment> findAllByCourseAndRoundNumber(Course course, int roundNumber);

    List<Assignment> findAllByCreatedBy(User createdBy);
}
