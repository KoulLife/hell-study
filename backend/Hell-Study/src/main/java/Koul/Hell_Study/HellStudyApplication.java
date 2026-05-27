package Koul.Hell_Study;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class HellStudyApplication {

	public static void main(String[] args) {
		SpringApplication.run(HellStudyApplication.class, args);
	}

}
