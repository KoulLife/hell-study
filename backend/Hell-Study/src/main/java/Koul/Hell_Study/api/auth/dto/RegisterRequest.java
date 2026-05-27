package Koul.Hell_Study.api.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RegisterRequest {
    private String loginId;
    private String password;
    private String name;
    private String email;
}
