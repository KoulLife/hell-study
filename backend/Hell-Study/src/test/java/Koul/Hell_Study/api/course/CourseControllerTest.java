package Koul.Hell_Study.api.course;

import Koul.Hell_Study.api.course.dto.CourseResponse;
import Koul.Hell_Study.application.course.CourseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CourseController.class)
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CourseService courseService;

    @Test
    @WithMockUser(username = "adminUser", roles = "ADMIN")
    void 코스_생성_성공_ADMIN() throws Exception {
        CourseResponse response = CourseResponse.builder()
                .id(1L)
                .title("Spring Boot 스터디")
                .description("스프링 부트 기초 과정")
                .totalRounds(10)
                .completedRounds(0)
                .createdByName("관리자")
                .createdAt(LocalDateTime.now())
                .build();

        given(courseService.create(any(), eq("adminUser")))
                .willReturn(response);

        Map<String, Object> requestBody = Map.of(
                "title", "Spring Boot 스터디",
                "description", "스프링 부트 기초 과정",
                "totalRounds", 10
        );

        mockMvc.perform(post("/api/admin/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Spring Boot 스터디"))
                .andExpect(jsonPath("$.description").value("스프링 부트 기초 과정"))
                .andExpect(jsonPath("$.totalRounds").value(10))
                .andExpect(jsonPath("$.completedRounds").value(0))
                .andExpect(jsonPath("$.createdByName").value("관리자"));
    }

    @Test
    @WithMockUser(username = "normalUser", roles = "USER")
    void 코스_생성_실패_USER_권한없음() throws Exception {
        Map<String, Object> requestBody = Map.of(
                "title", "Spring Boot 스터디",
                "description", "스프링 부트 기초 과정",
                "totalRounds", 10
        );

        mockMvc.perform(post("/api/admin/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isForbidden());
    }
}