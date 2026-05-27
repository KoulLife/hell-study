package Koul.Hell_Study.api.submission.dto;

import Koul.Hell_Study.domain.submission.SubmissionStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EvaluateRequest {
    private SubmissionStatus status;
    private String feedback;
}
