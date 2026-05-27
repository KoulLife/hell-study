package Koul.Hell_Study.api.auth;

import Koul.Hell_Study.api.auth.dto.LoginRequest;
import Koul.Hell_Study.api.auth.dto.RegisterRequest;
import Koul.Hell_Study.application.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "인증 API")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "회원가입 신청", description = "신청 후 Admin의 승인이 있어야 서비스 이용 가능")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "성공 시 JSESSIONID 쿠키 발급")
    public ResponseEntity<Void> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        authService.login(request, httpRequest, httpResponse);
        return ResponseEntity.ok().build();
    }

    // POST /api/auth/logout 은 SecurityConfig에서 처리
}
