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

    @GetMapping("/topics")
    @Operation(summary = "발제 목록 조회 (2-2)")
    public ResponseEntity<List<TopicResponse>> getTopics() {
        return ResponseEntity.ok(topicService.getTopics());
    }

    @GetMapping("/topics/{id}")
    @Operation(summary = "발제 상세 조회")
    public ResponseEntity<TopicResponse> getTopic(@PathVariable Long id) {
        return ResponseEntity.ok(topicService.getTopic(id));
    }

    @PostMapping("/admin/topics")
    @Operation(summary = "발제 작성 - Admin 이상 (2-1)")
    public ResponseEntity<TopicResponse> create(
            @RequestBody TopicRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(topicService.create(request, userDetails.getUsername()));
    }

    @PutMapping("/admin/topics/{id}")
    @Operation(summary = "발제 수정 - Admin 이상")
    public ResponseEntity<TopicResponse> update(
            @PathVariable Long id,
            @RequestBody TopicRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(topicService.update(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/admin/topics/{id}")
    @Operation(summary = "발제 삭제 - Admin 이상")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        topicService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
