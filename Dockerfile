# syntax=docker/dockerfile:1

FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build
COPY pom.xml .
COPY src src
# Laufender Stand für die Anzeige unten in der App. Coolify baut ohne .git, gibt aber den Hash als
# SOURCE_COMMIT mit (Schalter „Include Source Commit in Build“). Die Commit-Zeit kommt von GitHub.
# Fehlt etwas, bleibt die Anzeige leer; der Build scheitert daran nie.
ARG SOURCE_COMMIT=""
RUN if [ -n "$SOURCE_COMMIT" ]; then \
      time=$(curl -fsS --max-time 10 "https://api.github.com/repos/realAP/questlog/commits/$SOURCE_COMMIT" \
        | grep -o '"date": *"[^"]*"' | sed -n 2p | cut -d'"' -f4) || true; \
      printf 'git.commit.id=%s\ngit.commit.time=%s\n' "$SOURCE_COMMIT" "$time" > src/main/resources/git.properties; \
    fi
# Statische Prüfungen und Tests laufen in der Pipeline; hier wird nur gebaut.
RUN --mount=type=cache,target=/root/.m2 mvn -B -q package -DskipTests

FROM eclipse-temurin:25-jre-alpine
RUN addgroup -S questlog && adduser -S questlog -G questlog
WORKDIR /app
COPY --from=build /build/target/questlog-*.jar app.jar
USER questlog
ENV TZ=Europe/Berlin \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"UP"' || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
