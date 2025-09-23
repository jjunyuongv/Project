FROM openjdk:21-jdk
WORKDIR /app
COPY build/libs/*SNAPSHOT.war app.war
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.war"]