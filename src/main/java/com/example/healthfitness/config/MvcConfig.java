package com.example.healthfitness.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // This maps a URL path to a directory on the file system.
        // Any request to "/profile-images/**" will be served from the "uploads/profile-images/" directory.
        // The "file:" prefix is crucial to specify it's a file system path.
        registry.addResourceHandler("/profile-images/**")
                .addResourceLocations("file:./uploads/profile-images/");
    }
}