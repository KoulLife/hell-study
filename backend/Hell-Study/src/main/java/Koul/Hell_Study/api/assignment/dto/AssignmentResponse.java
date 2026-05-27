package Koul.Hell_Study.api.assignment.dto;

import Koul.Hell_Study.domain.assignment.Assignment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AssignmentResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private Long courseId;
    private String createdByName;
    private LocalDateTime createdAt;

    public static AssignmentResponse from(Assignment assignment) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .deadline(assignment.getDeadline())
                .courseId(assignment.getCourse().getId())
                .createdByName(assignment.getCreatedBy().getName())
                .createdAt(assignment.getCreatedAt())
                .build();
    }
}
