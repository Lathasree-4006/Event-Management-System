
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml backend/pom.xml
COPY backend/.mvn backend/.mvn
COPY backend/mvnw backend/mvnw
COPY backend/src backend/src
RUN chmod +x backend/mvnw && \
    ./backend/mvnw -f backend/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/backend/target/Event_Management_System-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
