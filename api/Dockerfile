# dockerfile
FROM --platform=linux/${TARGETARCH} mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj ./
COPY . ./
RUN dotnet publish -c Release -o /app/out --self-contained false

FROM --platform=linux/${TARGETARCH} mcr.microsoft.com/dotnet/aspnet:8.0-jammy AS runtime
WORKDIR /app

# Install minimal crypto libs if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user and directories
RUN groupadd -g 1000 appgroup \
 && useradd -m -u 1000 -g 1000 appuser \
 && mkdir -p /app/keys \
 && chown -R appuser:appgroup /app /app/keys

EXPOSE 8080
EXPOSE 8081

COPY --from=build /app/out ./

USER 1000:1000

ENTRYPOINT ["dotnet", "Api.dll"]
