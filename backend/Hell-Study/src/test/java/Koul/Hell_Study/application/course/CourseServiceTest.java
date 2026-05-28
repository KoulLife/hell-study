package Koul.Hell_Study.application.course;

import Koul.Hell_Study.api.course.dto.CourseRequest;
import Koul.Hell_Study.api.course.dto.CourseResponse;
import Koul.Hell_Study.domain.course.Course;
import Koul.Hell_Study.domain.course.CourseRepository;
import Koul.Hell_Study.domain.user.Role;
import Koul.Hell_Study.domain.user.User;
import Koul.Hell_Study.domain.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @InjectMocks
    private CourseService courseService;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Test
    void 코스_생성_성공() {
        // given
        User admin = User.builder()
                .loginId("adminUser")
                .password("password123")
                .name("관리자")
                .email("admin@test.com")
                .build();
        admin.approve();
        admin.changeRole(Role.ADMIN);

        CourseRequest request = new CourseRequest();
        ReflectionTestUtils.setField(request, "title", "Spring Boot 스터디");
        ReflectionTestUtils.setField(request, "description", "스프링 부트 기초 과정");
        ReflectionTestUtils.setField(request, "totalRounds", 10);

        Course course = Course.builder()
                .title("Spring Boot 스터디")
                .description("스프링 부트 기초 과정")
                .totalRounds(10)
                .createdBy(admin)
                .build();

        given(userRepository.findByLoginId("adminUser")).willReturn(Optional.of(admin));
        given(courseRepository.save(any(Course.class))).willReturn(course);

        // when
        CourseResponse response = courseService.create(request, "adminUser");

        // then
        assertThat(response.getTitle()).isEqualTo("Spring Boot 스터디");
        assertThat(response.getDescription()).isEqualTo("스프링 부트 기초 과정");
        assertThat(response.getTotalRounds()).isEqualTo(10);
        assertThat(response.getCompletedRounds()).isZero();
        assertThat(response.getCreatedByName()).isEqualTo("관리자");
    }
}
