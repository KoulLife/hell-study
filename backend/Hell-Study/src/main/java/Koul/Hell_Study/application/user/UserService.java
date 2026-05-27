package Koul.Hell_Study.application.user;

import Koul.Hell_Study.api.user.dto.UserResponse;
import Koul.Hell_Study.api.user.dto.RoleUpdateRequest;
import Koul.Hell_Study.domain.user.Role;
import Koul.Hell_Study.domain.user.User;
import Koul.Hell_Study.domain.user.UserRepository;
import Koul.Hell_Study.domain.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getMyInfo(String loginId) {
        return UserResponse.from(findByLoginId(loginId));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    public List<UserResponse> getPendingUsers() {
        return userRepository.findAllByStatus(UserStatus.PENDING).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public void approve(Long userId) {
        findById(userId).approve();
    }

    @Transactional
    public void reject(Long userId) {
        findById(userId).reject();
    }

    @Transactional
    public UserResponse changeRole(Long userId, RoleUpdateRequest request) {
        User user = findById(userId);
        user.changeRole(request.getRole());
        return UserResponse.from(user);
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));
    }

    private User findByLoginId(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));
    }
}
