package Koul.Hell_Study.api.user;

import Koul.Hell_Study.api.submission.dto.SubmissionResponse;
import Koul.Hell_Study.api.user.dto.UserResponse;
import Koul.Hell_Study.application.submission.SubmissionService;
import Koul.Hell_Study.application.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "유저 본인 정보 API")
public class UserController {

    private final UserService userService;
    private final SubmissionService submissionService;

    @GetMapping("/me")
    @Operation(summary = "내 정보 조회")
    public ResponseEntity<UserResponse> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getMyInfo(userDetails.getUsername()));
    }

    @GetMapping("/me/submissions")
    @Operation(summary = "내 과제 제출 이력 조회 (5-1)")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissions(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(submissionService.getMySubmissions(userDetails.getUsername()));
    }
}
