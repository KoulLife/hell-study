package Koul.Hell_Study.api.topic;

import Koul.Hell_Study.api.topic.dto.TopicRequest;
import Koul.Hell_Study.api.topic.dto.TopicResponse;
import Koul.Hell_Study.application.topic.TopicService;
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
@Tag(name = "Topic", description = "발제 API")
public class TopicController {

    private final TopicService topicService;

    // 코스+라운드별 발제 목록 조회 (수강 승인된 사용자 + Admin)
    @GetMapping("/courses/{courseId}/rounds/{roundNumber}/topics")
    @Operation(summary = "코스+라운드별 발제 목록 조회")
    public ResponseEntity<List<TopicResponse>> getTopics(
            @PathVariable Long courseId,
            @PathVariable int roundNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(topicService.getTopicsByCourseAndRound(courseId, roundNumber, userDetails.getUsername()));
    }

    // 발제 작성 (Admin 이상, 해당 코스 소유자 또는 SuperAdmin)
    @PostMapping("/admin/courses/{courseId}/rounds/{roundNumber}/topics")
    @Operation(summary = "발제 작성 - Admin 이상")
    public ResponseEntity<TopicResponse> create(
            @PathVariable Long courseId,
            @PathVariable int roundNumber,
            @RequestBody TopicRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(topicService.create(courseId, roundNumber, request, userDetails.getUsername()));
    }

    // 발제 수정
    @PutMapping("/admin/topics/{id}")
    @Operation(summary = "발제 수정")
    public ResponseEntity<TopicResponse> update(
            @PathVariable Long id,
            @RequestBody TopicRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(topicService.update(id, request, userDetails.getUsername()));
    }

    // 발제 삭제
    @DeleteMapping("/admin/topics/{id}")
    @Operation(summary = "발제 삭제")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        topicService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
