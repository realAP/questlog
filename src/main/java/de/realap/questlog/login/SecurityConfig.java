package de.realap.questlog.login;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices.RememberMeTokenAlgorithm;

/**
 * Formular-Login für einen Benutzer. Das Remember-me-Cookie hält die installierte PWA über Wochen
 * angemeldet; es ist signiert statt in der Datenbank gespeichert und übersteht so Neustarts.
 */
@Configuration
class SecurityConfig {

  /** Ohne Anmeldung erreichbar: PWA-Dateien, statische Ressourcen, Login und Health-Check. */
  private static final String[] PUBLIC_PATHS = {
    "/login",
    "/error",
    "/manifest.webmanifest",
    "/sw.js",
    "/icons/**",
    "/css/**",
    "/js/**",
    "/webjars/**",
    "/favicon.ico",
    "/actuator/health",
  };

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, RememberMeServices rememberMe) {
    return http.authorizeHttpRequests(requests ->
            requests.requestMatchers(PUBLIC_PATHS).permitAll().anyRequest().authenticated())
        .formLogin(form -> form.loginPage("/login").defaultSuccessUrl("/", true))
        .rememberMe(remember -> remember.rememberMeServices(rememberMe))
        .logout(logout -> logout.logoutSuccessUrl("/login"))
        .build();
  }

  @Bean
  UserDetailsService userDetailsService(LoginProperties login) {
    return new InMemoryUserDetailsManager(
        User.withUsername(login.username()).password("{noop}" + login.password()).build());
  }

  @Bean
  RememberMeServices rememberMeServices(UserDetailsService users, LoginProperties login) {
    var services =
        new TokenBasedRememberMeServices(
            login.rememberMeKey(), users, RememberMeTokenAlgorithm.SHA256);
    services.setAlwaysRemember(true);
    services.setTokenValiditySeconds(Math.toIntExact(login.rememberMeValidity().toSeconds()));
    return services;
  }
}
