package Koul.Hell_Study.api.course.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CourseRequest {
    private String title;
    private String description;
    private int totalRounds;
}
