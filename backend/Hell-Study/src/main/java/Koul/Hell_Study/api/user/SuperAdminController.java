package Koul.Hell_Study.api.user;

import Koul.Hell_Study.api.user.dto.RoleUpdateRequest;
import Koul.Hell_Study.api.user.dto.UserResponse;
import Koul.Hell_Study.api.submission.dto.SubmissionResponse;
import Koul.Hell_Study.application.submission.SubmissionService;
import Koul.Hell_Study.application.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
@Tag(name = "SuperAdmin", description = "SuperAdmin 전용 API")
public class SuperAdminController {

    private final UserService userService;
    private final SubmissionService submissionService;

    @GetMapping("/users")
    @Operation(summary = "전체 유저 목록 조회")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/pending")
    @Operation(summary = "승인 대기 유저 목록 조회 (1-3)")
    public ResponseEntity<List<UserResponse>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    @PostMapping("/users/{userId}/approve")
    @Operation(summary = "회원가입 승인 (1-3)")
    public ResponseEntity<Void> approve(@PathVariable Long userId) {
        userService.approve(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}/reject")
    @Operation(summary = "회원가입 거절 (1-3)")
    public ResponseEntity<Void> reject(@PathVariable Long userId) {
        userService.reject(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "유저 권한 변경")
    public ResponseEntity<UserResponse> changeRole(
            @PathVariable Long userId,
            @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(userService.changeRole(userId, request));
    }

    @GetMapping("/users/{userId}/submissions")
    @Operation(summary = "특정 유저의 과제 제출 이력 조회 (5-2)")
    public ResponseEntity<List<SubmissionResponse>> getUserSubmissions(@PathVariable Long userId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByUser(userId));
    }
}
