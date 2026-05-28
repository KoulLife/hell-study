package Koul.Hell_Study.api.enrollment.dto;

import Koul.Hell_Study.domain.enrollment.CourseEnrollment;
import Koul.Hell_Study.domain.enrollment.EnrollmentStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class EnrollmentResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private Long applicantId;
    private String applicantName;
    private EnrollmentStatus status;
    private LocalDateTime createdAt;

    public static EnrollmentResponse from(CourseEnrollment enrollment) {
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .applicantId(enrollment.getApplicant().getId())
                .applicantName(enrollment.getApplicant().getName())
                .status(enrollment.getStatus())
                .createdAt(enrollment.getCreatedAt())
                .build();
    }
}
