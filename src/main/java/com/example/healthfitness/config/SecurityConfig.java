package com.example.healthfitness.config;

import com.example.healthfitness.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // **Step 1: Allow access to static resources and auth endpoints**
                // All HTML, CSS, JS, and the root path are now public.
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/login.html",
                    "/signup.html",
                    "/dashboard.html",
                    "/workouts.html",
                    "/meals.html",
                    "/goals.html",
                    "/progress.html",
                    "/css/**",
                    "/js/**",
                    "/images/**",
                    "/api/auth/**" // Auth endpoints are public
                ).permitAll()
                
                // **Step 2: Protect all other API endpoints**
                // Any request to `/api/` that is not `/api/auth/` will require the USER role.
                .requestMatchers("/api/**").hasRole("USER")
                
                // **Step 3: Any other request not defined above needs to be authenticated**
                // This is a good fallback.
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}