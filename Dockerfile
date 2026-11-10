# syntax=docker/dockerfile:1

FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build
COPY pom.xml .
COPY src src
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
