# Start with the SDK image for AMD64
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS builder
WORKDIR /app

# Copy and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore -r linux-$TARGETARCH

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out --self-contained false --no-restore -r linux-$TARGETARCH

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
COPY --from=builder /app/out ./ 
ENTRYPOINT ["dotnet", "portfolio.dll"]