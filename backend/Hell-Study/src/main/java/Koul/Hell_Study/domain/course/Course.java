package Koul.Hell_Study.domain.course;

import Koul.Hell_Study.domain.assignment.Assignment;
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
@Table(name = "courses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // 총 회차 수 (코스 생성 시 설정)
    @Column(nullable = false)
    private int totalRounds;

    // 완료된 회차 수 (Admin이 회차 완료 처리 시 증가)
    @Column(nullable = false)
    private int completedRounds = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Assignment> assignments = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private Course(String title, String description, int totalRounds, User createdBy) {
        this.title = title;
        this.description = description;
        this.totalRounds = totalRounds;
        this.createdBy = createdBy;
    }

    public void update(String title, String description, int totalRounds) {
        if (totalRounds < this.completedRounds) {
            throw new IllegalArgumentException(
                "총 회차 수는 완료된 회차 수(" + this.completedRounds + ")보다 작을 수 없습니다.");
        }
        this.title = title;
        this.description = description;
        this.totalRounds = totalRounds;
    }

    // Admin이 한 회차 완료 처리
    public void completeRound() {
        if (this.completedRounds >= this.totalRounds) {
            throw new IllegalStateException("이미 모든 회차가 완료되었습니다.");
        }
        this.completedRounds++;
    }

    public boolean isOwnedBy(User user) {
        return this.createdBy.getId().equals(user.getId());
    }
}
