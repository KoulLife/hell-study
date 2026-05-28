package Koul.Hell_Study.api.assignment;

import Koul.Hell_Study.api.assignment.dto.AssignmentRequest;
import Koul.Hell_Study.api.assignment.dto.AssignmentResponse;
import Koul.Hell_Study.api.submission.dto.SubmissionRequest;
import Koul.Hell_Study.api.submission.dto.SubmissionResponse;
import Koul.Hell_Study.application.assignment.AssignmentService;
import Koul.Hell_Study.application.submission.SubmissionService;
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
@Tag(name = "Assignment", description = "과제 API")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final SubmissionService submissionService;

    @GetMapping("/courses/{courseId}/assignments")
    @Operation(summary = "코스별 과제 목록 조회 - 수강 승인된 사용자만")
    public ResponseEntity<List<AssignmentResponse>> getAssignments(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByCourse(courseId, userDetails.getUsername()));
    }

    @GetMapping("/courses/{courseId}/rounds/{roundNumber}/assignments")
    @Operation(summary = "라운드별 과제 목록 조회 - 수강 승인된 사용자만")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByRound(
            @PathVariable Long courseId,
            @PathVariable int roundNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByRound(courseId, roundNumber, userDetails.getUsername()));
    }

    @GetMapping("/assignments/{id}")
    @Operation(summary = "과제 상세 조회 - 수강 승인된 사용자만")
    public ResponseEntity<AssignmentResponse> getAssignment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(assignmentService.getAssignment(id, userDetails.getUsername()));
    }

    @PostMapping("/admin/courses/{courseId}/assignments")
    @Operation(summary = "과제 생성 - Admin은 자신이 개설한 코스에만 (4-2)")
    public ResponseEntity<AssignmentResponse> create(
            @PathVariable Long courseId,
            @RequestBody AssignmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assignmentService.create(courseId, request, userDetails.getUsername()));
    }

    @PutMapping("/admin/assignments/{id}")
    @Operation(summary = "과제 수정 - Admin은 자신이 개설한 것만")
    public ResponseEntity<AssignmentResponse> update(
            @PathVariable Long id,
            @RequestBody AssignmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(assignmentService.update(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/admin/assignments/{id}")
    @Operation(summary = "과제 삭제 - Admin은 자신이 개설한 것만")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        assignmentService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    // 과제 제출 (User, 3-1)
    @PostMapping("/assignments/{assignmentId}/submissions")
    @Operation(summary = "과제 제출 - 기한 내에만 가능 (3-1, 3-2)")
    public ResponseEntity<SubmissionResponse> submit(
            @PathVariable Long assignmentId,
            @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.submit(assignmentId, request, userDetails.getUsername()));
    }

    // 내 제출 단건 조회 (User, 특정 과제)
    @GetMapping("/assignments/{assignmentId}/my-submission")
    @Operation(summary = "내 과제 제출 조회 - 수강자 본인 제출 확인")
    public ResponseEntity<SubmissionResponse> getMySubmission(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        SubmissionResponse result = submissionService.getMySubmissionByAssignment(assignmentId, userDetails.getUsername());
        if (result == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(result);
    }

    // 과제별 제출 목록 (Admin, 5-2)
    @GetMapping("/admin/assignments/{assignmentId}/submissions")
    @Operation(summary = "과제별 제출 목록 조회 - Admin은 자신이 개설한 과제만 (5-2)")
    public ResponseEntity<List<SubmissionResponse>> getSubmissions(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(assignmentId, userDetails.getUsername()));
    }

    // 합격/불합격 설정 (Admin, 3-5)
    @PutMapping("/admin/submissions/{submissionId}/evaluate")
    @Operation(summary = "합격/불합격 및 피드백 설정 (3-5)")
    public ResponseEntity<SubmissionResponse> evaluate(
            @PathVariable Long submissionId,
            @RequestBody Koul.Hell_Study.api.submission.dto.EvaluateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(submissionService.evaluate(submissionId, request, userDetails.getUsername()));
    }
}
