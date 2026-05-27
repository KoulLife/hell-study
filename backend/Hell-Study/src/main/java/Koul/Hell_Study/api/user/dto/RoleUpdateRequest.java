package Koul.Hell_Study.api.user.dto;

import Koul.Hell_Study.domain.user.Role;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RoleUpdateRequest {
    private Role role;
}
