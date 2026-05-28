package Koul.Hell_Study.domain.assignment;

import Koul.Hell_Study.domain.course.Course;
import Koul.Hell_Study.domain.submission.Submission;
import Koul.Hell_Study.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assignments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // 과제 제출 기한 (3-3: Admin이 날짜와 시간 기준으로 설정)
    @Column(nullable = false)
    private LocalDateTime deadline;

    // 소속 라운드 번호 (1부터 시작, Course.totalRounds 이하)
    @Column(nullable = false)
    private int roundNumber;

    // 라운드 종료 시 true로 변경 — 이후 제출 불가
    @Column(nullable = false)
    private boolean closed = false;

    // 코스 하위 과제 (4-2)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // 과제를 개설한 Admin (Admin은 자신이 개설한 것만 수정 가능)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // 과제 제출 이력 (3-4: 이력으로 남아야 함)
    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Submission> submissions = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private Assignment(String title, String description, LocalDateTime deadline,
                       int roundNumber, Course course, User createdBy) {
        this.title = title;
        this.description = description;
        this.deadline = deadline;
        this.roundNumber = roundNumber;
        this.course = course;
        this.createdBy = createdBy;
    }

    public void update(String title, String description, LocalDateTime deadline) {
        this.title = title;
        this.description = description;
        this.deadline = deadline;
    }

    public void close() {
        this.closed = true;
    }

    // 제출 기한이 지났는지 확인 (3-2: 기한 이후 제출 불가)
    public boolean isDeadlinePassed() {
        return LocalDateTime.now().isAfter(this.deadline);
    }

    // Admin이 소유자인지 확인 (서비스 레이어 권한 검증용)
    public boolean isOwnedBy(User user) {
        return this.createdBy.getId().equals(user.getId());
    }
}
