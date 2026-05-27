package Koul.Hell_Study.domain.submission;

import Koul.Hell_Study.domain.assignment.Assignment;
import Koul.Hell_Study.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    // 제출한 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 합격/불합격 상태 (3-5: Admin이 설정)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status;

    // 피드백 (3-5: Admin이 작성, nullable)
    @Column(columnDefinition = "TEXT")
    private String feedback;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private Submission(Assignment assignment, User user, String content) {
        this.assignment = assignment;
        this.user = user;
        this.content = content;
        this.status = SubmissionStatus.SUBMITTED;
    }

    // Admin이 합격/불합격 및 피드백 설정 (3-5)
    public void evaluate(SubmissionStatus status, String feedback) {
        this.status = status;
        this.feedback = feedback;
    }
}
