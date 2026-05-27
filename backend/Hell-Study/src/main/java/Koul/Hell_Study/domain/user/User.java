package Koul.Hell_Study.domain.user;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String loginId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private User(String loginId, String password, String name, String email) {
        this.loginId = loginId;
        this.password = password;
        this.name = name;
        this.email = email;
        this.role = Role.USER;
        this.status = UserStatus.PENDING;
    }

    public void approve() {
        this.status = UserStatus.APPROVED;
    }

    public void reject() {
        this.status = UserStatus.REJECTED;
    }

    public boolean isApproved() {
        return this.status == UserStatus.APPROVED;
    }

    public void changeRole(Role role) {
        this.role = role;
    }
}
