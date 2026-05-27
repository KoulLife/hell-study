package Koul.Hell_Study.api.assignment.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class AssignmentRequest {
    private String title;
    private String description;
    private LocalDateTime deadline;
}
