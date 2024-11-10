# Use the .NET SDK image for building the application (no platform-specific builds in Dockerfile)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build the application
COPY . ./
RUN dotnet build -c Release

# Publish the application
RUN dotnet publish -c Release -o /app/out --self-contained false

# Runtime image (this is the common base image)
FROM mcr.microsoft.com/dotnet/aspnet:8.0-jammy AS runtime
WORKDIR /app

# Install OpenSSL and other required cryptographic libraries
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Create directory for data protection keys
RUN mkdir /app/keys && chown -R 1000:1000 /app/keys

# Copy the certificate into the container and set proper permissions
COPY ./certificate.pfx /app/keys/
RUN chmod 644 /app/keys/certificate.pfx

# Expose ports
EXPOSE 8080
EXPOSE 8081

# Copy the published output from the build stage
COPY --from=build /app/out ./

# Set the entry point for the app
ENTRYPOINT ["dotnet", "Api.dll"]