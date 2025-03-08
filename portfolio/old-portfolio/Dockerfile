ARG TARGETARCH=arm64

# Start with the SDK image for AMD64
FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/sdk:8.0 AS build-amd64
WORKDIR /app

# Copy and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore -r linux-x64

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out -r linux-x64 --self-contained false --no-restore

# Build ARM64 version
FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/sdk:8.0 AS build-arm64
WORKDIR /app

# Copy and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore -r linux-arm64

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out -r linux-arm64 --self-contained false --no-restore

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0-jammy AS runtime
WORKDIR /app

# Create directory for data protection keys
RUN mkdir /app/keys && chown -R 1000:1000 /app/keys
COPY ./wwwroot/MyWork.json /app/wwwroot/MyWork.json

# Expose both ports
EXPOSE 8080
EXPOSE 8081

# Copy the appropriate build output
FROM runtime AS final-amd64
COPY --from=build-amd64 /app/out ./
ENTRYPOINT ["dotnet", "portfolio.dll"]

FROM runtime AS final-arm64
COPY --from=build-arm64 /app/out ./
ENTRYPOINT ["dotnet", "portfolio.dll"]

# Use a multi-stage build to select the appropriate final image
FROM final-${TARGETARCH}