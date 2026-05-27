package Koul.Hell_Study.domain.course;

import Koul.Hell_Study.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findAllByCreatedBy(User createdBy);
}
