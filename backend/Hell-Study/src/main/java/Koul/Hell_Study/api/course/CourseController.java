package Koul.Hell_Study.api.course;

import Koul.Hell_Study.api.course.dto.CourseRequest;
import Koul.Hell_Study.api.course.dto.CourseResponse;
import Koul.Hell_Study.application.course.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Course", description = "코스 API")
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/courses")
    @Operation(summary = "코스 목록 조회")
    public ResponseEntity<List<CourseResponse>> getCourses() {
        return ResponseEntity.ok(courseService.getCourses());
    }

    @GetMapping("/courses/{id}")
    @Operation(summary = "코스 상세 조회")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourse(id));
    }

    @PostMapping("/admin/courses")
    @Operation(summary = "코스 생성 - Admin 이상 (4-1)")
    public ResponseEntity<CourseResponse> create(
            @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.create(request, userDetails.getUsername()));
    }

    @PutMapping("/admin/courses/{id}")
    @Operation(summary = "코스 수정 - Admin은 자신이 개설한 것만")
    public ResponseEntity<CourseResponse> update(
            @PathVariable Long id,
            @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(courseService.update(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/admin/courses/{id}")
    @Operation(summary = "코스 삭제 - Admin은 자신이 개설한 것만")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        courseService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/courses/{id}/complete-round")
    @Operation(summary = "회차 완료 처리 - completedRounds + 1 (Admin은 자신이 개설한 것만)")
    public ResponseEntity<CourseResponse> completeRound(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(courseService.completeRound(id, userDetails.getUsername()));
    }
}
