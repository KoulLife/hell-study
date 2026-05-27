package Koul.Hell_Study.infrastructure.security;

import Koul.Hell_Study.domain.user.User;
import Koul.Hell_Study.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new UsernameNotFoundException("존재하지 않는 아이디입니다: " + loginId));

        // 승인된 사용자만 로그인 가능 (1-4)
        if (!user.isApproved()) {
            throw new UsernameNotFoundException("승인되지 않은 계정입니다: " + loginId);
        }

        return new org.springframework.security.core.userdetails.User(
                user.getLoginId(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
