# dockerfile
FROM --platform=linux/${TARGETARCH} mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY *.csproj ./
COPY . ./
RUN dotnet publish -c Release -o /app/out --self-contained false

FROM --platform=linux/${TARGETARCH} mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app

# Install minimal crypto libs if needed
RUN apk add --no-cache \
    openssl \
    ca-certificates \
    libressl

# Create non-root user and directories
RUN addgroup -g 1000 appgroup \
 && adduser -D -u 1000 -G appgroup appuser \
 && mkdir -p /app/keys \
 && chown -R appuser:appgroup /app /app/keys

EXPOSE 8080
EXPOSE 8081

COPY --from=build /app/out ./

USER 1000:1000

ENTRYPOINT ["dotnet", "Api.dll"]
