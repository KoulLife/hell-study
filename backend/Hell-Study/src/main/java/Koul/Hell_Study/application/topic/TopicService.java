package Koul.Hell_Study.application.topic;

import Koul.Hell_Study.api.topic.dto.TopicRequest;
import Koul.Hell_Study.api.topic.dto.TopicResponse;
import Koul.Hell_Study.domain.topic.Topic;
import Koul.Hell_Study.domain.topic.TopicRepository;
import Koul.Hell_Study.domain.user.Role;
import Koul.Hell_Study.domain.user.User;
import Koul.Hell_Study.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicService {

    private final TopicRepository topicRepository;
    private final UserRepository userRepository;

    public List<TopicResponse> getTopics() {
        return topicRepository.findAll().stream()
                .map(TopicResponse::from)
                .toList();
    }

    public TopicResponse getTopic(Long id) {
        return TopicResponse.from(findById(id));
    }

    @Transactional
    public TopicResponse create(TopicRequest request, String loginId) {
        User author = findUser(loginId);
        Topic topic = Topic.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .author(author)
                .build();
        return TopicResponse.from(topicRepository.save(topic));
    }

    @Transactional
    public TopicResponse update(Long id, TopicRequest request, String loginId) {
        Topic topic = findById(id);
        validateOwnership(topic, findUser(loginId));
        topic.update(request.getTitle(), request.getContent());
        return TopicResponse.from(topic);
    }

    @Transactional
    public void delete(Long id, String loginId) {
        Topic topic = findById(id);
        validateOwnership(topic, findUser(loginId));
        topicRepository.delete(topic);
    }

    // SuperAdmin은 모든 발제 수정/삭제 가능, Admin은 자신이 작성한 것만
    private void validateOwnership(Topic topic, User user) {
        if (user.getRole() != Role.SUPER_ADMIN && !topic.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }
    }

    private Topic findById(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 발제입니다."));
    }

    private User findUser(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));
    }
}
