# Build stage
FROM ubuntu:22.04 AS build

# Install dependencies and Java
RUN apt-get update && \
    apt-get install -y wget unzip software-properties-common && \
    add-apt-repository ppa:openjdk-r/ppa && \
    apt-get update && \
    apt-get install -y openjdk-21-jdk-headless maven && \
    rm -rf /var/lib/apt/lists/*

# Set environment variables
RUN JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java)))) && \
    echo "export JAVA_HOME=$JAVA_HOME" >> /etc/environment && \
    echo "export PATH=$PATH:$JAVA_HOME/bin" >> /etc/environment

# Copy project files
COPY . /app
WORKDIR /app

# Build the project using Maven
RUN . /etc/environment && mvn clean package -DskipTests

# Final stage
FROM openjdk:24-ea-22-oraclelinux8

# Copy the built artifact from the build stage
COPY --from=build /app/target/api-0.0.1-SNAPSHOT.jar /app.jar

# Set the entrypoint
ENTRYPOINT ["java", "-jar", "/app.jar"]