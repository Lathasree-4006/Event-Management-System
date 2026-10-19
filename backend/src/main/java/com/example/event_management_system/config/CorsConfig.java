package com.example.event_management_system.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
  @Bean
public WebMvcConfigurer corsConfigurer() {
    String frontendUrl = System.getenv("FRONTEND_URL");

    if (frontendUrl == null || frontendUrl.isBlank()) {
        throw new IllegalStateException(
            "FRONTEND_URL environment variable is not configured"
        );
    }

    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**")
                    .allowedOrigins(frontendUrl)
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*");
        }
    };
}
}
