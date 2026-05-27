package Koul.Hell_Study.api.topic.dto;

import Koul.Hell_Study.domain.topic.Topic;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TopicResponse {
    private Long id;
    private String title;
    private String content;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TopicResponse from(Topic topic) {
        return TopicResponse.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .content(topic.getContent())
                .authorName(topic.getAuthor().getName())
                .createdAt(topic.getCreatedAt())
                .updatedAt(topic.getUpdatedAt())
                .build();
    }
}
