package Koul.Hell_Study.api.user.dto;

import Koul.Hell_Study.domain.user.Role;
import Koul.Hell_Study.domain.user.User;
import Koul.Hell_Study.domain.user.UserStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String loginId;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .loginId(user.getLoginId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
