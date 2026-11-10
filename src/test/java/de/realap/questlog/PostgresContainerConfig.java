package de.realap.questlog;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;

/** Echte PostgreSQL für Integrationstests, dieselbe Hauptversion wie in docker-compose.yml. */
@TestConfiguration(proxyBeanMethods = false)
public class PostgresContainerConfig {

  @Bean
  @ServiceConnection
  PostgreSQLContainer postgres() {
    return new PostgreSQLContainer("postgres:18-alpine");
  }
}
