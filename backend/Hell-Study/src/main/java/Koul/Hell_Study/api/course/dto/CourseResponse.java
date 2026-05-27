package Koul.Hell_Study.api.course.dto;

import Koul.Hell_Study.domain.course.Course;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private int totalRounds;
    private int completedRounds;
    private String createdByName;
    private LocalDateTime createdAt;

    public static CourseResponse from(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .totalRounds(course.getTotalRounds())
                .completedRounds(course.getCompletedRounds())
                .createdByName(course.getCreatedBy().getName())
                .createdAt(course.getCreatedAt())
                .build();
    }
}
