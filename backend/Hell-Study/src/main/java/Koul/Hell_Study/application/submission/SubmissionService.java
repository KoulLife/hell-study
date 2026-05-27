package Koul.Hell_Study.application.submission;

import Koul.Hell_Study.api.submission.dto.EvaluateRequest;
import Koul.Hell_Study.api.submission.dto.SubmissionRequest;
import Koul.Hell_Study.api.submission.dto.SubmissionResponse;
import Koul.Hell_Study.domain.assignment.Assignment;
import Koul.Hell_Study.domain.assignment.AssignmentRepository;
import Koul.Hell_Study.domain.submission.Submission;
import Koul.Hell_Study.domain.submission.SubmissionRepository;
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
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    // 과제 제출 (User, 3-1 ~ 3-2)
    @Transactional
    public SubmissionResponse submit(Long assignmentId, SubmissionRequest request, String loginId) {
        Assignment assignment = findAssignment(assignmentId);
        User user = findUser(loginId);

        if (assignment.isDeadlinePassed()) {
            throw new IllegalStateException("과제 제출 기한이 지났습니다.");
        }

        Submission submission = Submission.builder()
                .assignment(assignment)
                .user(user)
                .content(request.getContent())
                .build();
        return SubmissionResponse.from(submissionRepository.save(submission));
    }

    // 내 제출 이력 (User, 5-1)
    public List<SubmissionResponse> getMySubmissions(String loginId) {
        User user = findUser(loginId);
        return submissionRepository.findAllByUser(user).stream()
                .map(SubmissionResponse::from)
                .toList();
    }

    // 과제별 제출 목록 (Admin, 5-2)
    public List<SubmissionResponse> getSubmissionsByAssignment(Long assignmentId, String loginId) {
        Assignment assignment = findAssignment(assignmentId);
        User admin = findUser(loginId);

        if (admin.getRole() != Role.SUPER_ADMIN && !assignment.isOwnedBy(admin)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        return submissionRepository.findAllByAssignment(assignment).stream()
                .map(SubmissionResponse::from)
                .toList();
    }

    // 특정 유저의 제출 이력 전체 조회 (Admin/SuperAdmin, 5-2)
    public List<SubmissionResponse> getSubmissionsByUser(Long userId) {
        return submissionRepository.findAllByUser_Id(userId).stream()
                .map(SubmissionResponse::from)
                .toList();
    }

    // 합격/불합격 + 피드백 (Admin, 3-5)
    @Transactional
    public SubmissionResponse evaluate(Long submissionId, EvaluateRequest request, String loginId) {
        Submission submission = findById(submissionId);
        User admin = findUser(loginId);

        if (admin.getRole() != Role.SUPER_ADMIN && !submission.getAssignment().isOwnedBy(admin)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        submission.evaluate(request.getStatus(), request.getFeedback());
        return SubmissionResponse.from(submission);
    }

    private Submission findById(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 제출입니다."));
    }

    private Assignment findAssignment(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 과제입니다."));
    }

    private User findUser(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));
    }
}
