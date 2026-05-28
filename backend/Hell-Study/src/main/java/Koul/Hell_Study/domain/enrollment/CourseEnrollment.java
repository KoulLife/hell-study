package Koul.Hell_Study.domain.enrollment;

import Koul.Hell_Study.domain.course.Course;
import Koul.Hell_Study.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "course_enrollments",
    uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "applicant_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class CourseEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private CourseEnrollment(Course course, User applicant) {
        this.course = course;
        this.applicant = applicant;
        this.status = EnrollmentStatus.PENDING;
    }

    public void approve() {
        this.status = EnrollmentStatus.APPROVED;
    }

    public void reject() {
        this.status = EnrollmentStatus.REJECTED;
    }

    public boolean isPending() {
        return this.status == EnrollmentStatus.PENDING;
    }
}
