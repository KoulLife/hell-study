package Koul.Hell_Study.domain.submission;

import Koul.Hell_Study.domain.assignment.Assignment;
import Koul.Hell_Study.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findAllByUser(User user);

    List<Submission> findAllByAssignment(Assignment assignment);

    List<Submission> findAllByUser_Id(Long userId);

    boolean existsByAssignmentInAndStatus(List<Assignment> assignments, SubmissionStatus status);

    java.util.Optional<Submission> findByAssignmentIdAndUserId(Long assignmentId, Long userId);
}
