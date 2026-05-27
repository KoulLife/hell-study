package Koul.Hell_Study.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hell Study API")
                        .description("Hell Study 백엔드 API 문서")
                        .version("v1.0.0"))
                // 세션 기반 인증 → JSESSIONID 쿠키
                .addSecurityItem(new SecurityRequirement().addList("cookieAuth"))
                .components(new Components()
                        .addSecuritySchemes("cookieAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.COOKIE)
                                        .name("JSESSIONID")
                                        .description("로그인 후 발급되는 세션 쿠키")));
    }
}
