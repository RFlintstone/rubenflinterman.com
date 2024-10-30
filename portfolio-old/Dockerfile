# Build stage
FROM ubuntu:22.04 AS build

# Install dependencies and Java
RUN apt-get update && \
    apt-get install -y wget unzip software-properties-common && \
    add-apt-repository ppa:openjdk-r/ppa && \
    apt-get update && \
    apt-get install -y openjdk-21-jdk-headless && \
    rm -rf /var/lib/apt/lists/*

# Set environment variables
RUN JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java)))) && \
    echo "export JAVA_HOME=$JAVA_HOME" >> /etc/environment && \
    echo "export PATH=$PATH:$JAVA_HOME/bin" >> /etc/environment

# Copy project files
COPY . /app
WORKDIR /app

# Ensure Gradle wrapper is executable
RUN chmod +x gradlew

# Build the project using Gradle wrapper
RUN . /etc/environment && ./gradlew build --stacktrace

# Final stage
FROM openjdk:21-slim

# Copy the built artifact from the build stage
COPY --from=build /app/build/libs/portfolio-0.0.1-SNAPSHOT.jar /app.jar

# Set the entrypoint
ENTRYPOINT ["java", "-jar", "/app.jar"]