package Koul.Hell_Study.api.submission.dto;

import Koul.Hell_Study.domain.submission.Submission;
import Koul.Hell_Study.domain.submission.SubmissionStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SubmissionResponse {
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private String userName;
    private String content;
    private SubmissionStatus status;
    private String feedback;
    private LocalDateTime createdAt;

    public static SubmissionResponse from(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment().getId())
                .assignmentTitle(submission.getAssignment().getTitle())
                .userName(submission.getUser().getName())
                .content(submission.getContent())
                .status(submission.getStatus())
                .feedback(submission.getFeedback())
                .createdAt(submission.getCreatedAt())
                .build();
    }
}
