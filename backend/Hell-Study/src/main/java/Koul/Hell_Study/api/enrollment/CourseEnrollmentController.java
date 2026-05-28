package Koul.Hell_Study.api.enrollment;

import Koul.Hell_Study.api.enrollment.dto.EnrollmentResponse;
import Koul.Hell_Study.application.enrollment.CourseEnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "CourseEnrollment", description = "코스 신청 API")
public class CourseEnrollmentController {

    private final CourseEnrollmentService enrollmentService;

    @GetMapping("/enrollments/my")
    @Operation(summary = "내 수강신청 목록 조회")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(userDetails.getUsername()));
    }

    @PostMapping("/courses/{courseId}/enroll")
    @Operation(summary = "코스 신청 - 코스 소유자 제외 모든 인증 사용자")
    public ResponseEntity<EnrollmentResponse> apply(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enrollmentService.apply(courseId, userDetails.getUsername()));
    }

    @GetMapping("/admin/courses/{courseId}/enrollments")
    @Operation(summary = "코스별 신청 목록 조회 - 코스 Admin 또는 SUPER_ADMIN")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollments(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(enrollmentService.getEnrollments(courseId, userDetails.getUsername()));
    }

    @PutMapping("/admin/enrollments/{enrollmentId}/approve")
    @Operation(summary = "신청 수락 - 코스 Admin 또는 SUPER_ADMIN")
    public ResponseEntity<EnrollmentResponse> approve(
            @PathVariable Long enrollmentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(enrollmentService.approve(enrollmentId, userDetails.getUsername()));
    }

    @PutMapping("/admin/enrollments/{enrollmentId}/reject")
    @Operation(summary = "신청 거절 - 코스 Admin 또는 SUPER_ADMIN")
    public ResponseEntity<EnrollmentResponse> reject(
            @PathVariable Long enrollmentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(enrollmentService.reject(enrollmentId, userDetails.getUsername()));
    }
}
