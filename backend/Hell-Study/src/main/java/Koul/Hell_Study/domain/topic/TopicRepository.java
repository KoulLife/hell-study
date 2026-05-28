package Koul.Hell_Study.domain.topic;

import Koul.Hell_Study.domain.course.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findAllByCourseAndRoundNumberOrderByCreatedAtAsc(Course course, int roundNumber);

    List<Topic> findAllByCourse(Course course);
}
