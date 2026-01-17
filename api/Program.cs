using System;
using System.Collections;
using System.IO;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using Api.Controllers.Auth;
using Api.Datastore;
using Api.Services.Auth;
using Api.Services.Users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

namespace Api;

public class Program
{
    private static void LoadFileEnvironmentVariablesIntoConfiguration(ConfigurationManager config)
    {
        // Read environment variables that end with _FILE and load the file contents
        // into configuration under the same name without the suffix. Convert "__" to ":".
        foreach (DictionaryEntry entry in Environment.GetEnvironmentVariables())
        {
            if (entry.Key is not string name) continue;
            if (!name.EndsWith("_FILE", StringComparison.Ordinal)) continue;

            var path = entry.Value as string;
            if (string.IsNullOrEmpty(path)) continue;

            try
            {
                if (!File.Exists(path)) continue;
                var content = File.ReadAllText(path).Trim();
                var key = name.Substring(0, name.Length - "_FILE".Length).Replace("__", ":");
                // set into configuration so later reads (GetConnectionString, configuration["..."]) work
                config[key] = content;
            }
            catch
            {
                // swallow errors and avoid logging secrets
            }
        }
    }

    private static void ConfigureCertificateProtection(WebApplicationBuilder builder, IConfiguration configuration)
    {
        // Key storage path must come from config/secrets and be created with restricted permissions by ops.
        var keyPath = configuration["DataProtection:KeyPath"];

        // Prefer mounted keys path created by the compose volume
        if (string.IsNullOrEmpty(keyPath))
        {
            var dockerKeysPath = "/app/keys";
            keyPath = Directory.Exists(dockerKeysPath) ? dockerKeysPath : Path.Combine(Directory.GetCurrentDirectory(), "keys");
        }

        Directory.CreateDirectory(keyPath);

        // Prefer certificate from a secure store / secret manager. Password should be provided via config
        var certificatePath = configuration["Certificate:Path"];
        // Prefer configuration value populated from `*_FILE` mapping; fall back to legacy env var if present
        var certificatePassword = configuration["Certificate:Password"] ?? Environment.GetEnvironmentVariable("CERT_PASSWORD");

        var dpBuilder = builder.Services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo(keyPath))
            .SetApplicationName(configuration["DataProtection:AppName"] ?? "Api-Prod");

        if (!string.IsNullOrEmpty(certificatePath) && File.Exists(certificatePath) && !string.IsNullOrEmpty(certificatePassword))
        {
            try
            {
                var cert = new X509Certificate2(certificatePath, certificatePassword, X509KeyStorageFlags.EphemeralKeySet);
                if (cert.HasPrivateKey)
                {
                    dpBuilder.ProtectKeysWithCertificate(cert);
                }
            }
            catch
            {
                // avoid leaking sensitive info; fallback below
            }
        }
        else
        {
            if (OperatingSystem.IsWindows())
            {
                dpBuilder.ProtectKeysWithDpapi();
            }
            else
            {
                var logger = LoggerFactory.Create(cfg => cfg.AddConsole()).CreateLogger(typeof(Program));
                logger.LogWarning("No certificate configured for key protection and not running on Windows; ensure key storage is protected and persistent (Redis/Azure Blob recommended).");
            }
        }
    }

    private static void ConfigureJwtAuthentication(WebApplicationBuilder builder, IConfiguration configuration)
    {
        // Prefer secrets from configuration which may have been populated by the *_FILE mapping
        var jwtSecretKey = configuration["JwtSettings:SecretKey"] ?? Environment.GetEnvironmentVariable("JWT_SECRET");
        var jwtIssuer = configuration["JwtSettings:Issuer"];
        var jwtAudience = configuration["JwtSettings:Audience"];

        if (string.IsNullOrEmpty(jwtSecretKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
        {
            throw new InvalidOperationException("JWT configuration incomplete. Use environment/secret store to provide secrets.");
        }

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = true;
                options.SaveToken = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    RequireSignedTokens = true,
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
                    ClockSkew = TimeSpan.FromMinutes(2)
                };
            });
    }

    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Load file-backed env vars (X_FILE -> configuration key) early so all reads use them
        LoadFileEnvironmentVariablesIntoConfiguration(builder.Configuration);
        var configuration = builder.Configuration;

        // runtime flags
        var isInDocker = configuration.GetValue<bool>("RUNNING_IN_DOCKER");
        var exposeAllInterfaces = configuration.GetValue<bool>("ExposeAllInterfaces", false);

        // Logging - avoid logging secrets
        builder.Logging.ClearProviders();
        builder.Logging.AddConsole();
        builder.Logging.AddDebug();

        // Kestrel bindings controlled by config. Default to loopback for safety.
        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            var ports = configuration.GetSection("Kestrel:Ports").Get<int[]>() ?? new[] { 8080 };
            foreach (var port in ports)
            {
                if (exposeAllInterfaces || isInDocker)
                {
                    serverOptions.ListenAnyIP(port);
                }
                else
                {
                    serverOptions.Listen(IPAddress.Loopback, port);
                }
            }
        });

        // Services
        builder.Services.AddAntiforgery();
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Register application services
        builder.Services.AddScoped<EncryptionService>();
        builder.Services.AddScoped<AuthController>();
        builder.Services.AddScoped<UserInfoService>();

        // Data protection - safer defaults and configurable key path
        ConfigureCertificateProtection(builder, configuration);

        // JWT auth
        ConfigureJwtAuthentication(builder, configuration);

        // CORS - whitelist origins via config
        var allowedOrigins = configuration["AllowedOrigins"]?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
        builder.Services.AddCors(opts =>
        {
            opts.AddPolicy("Strict", policy =>
            {
                if (allowedOrigins.Length > 0)
                    policy.WithOrigins(allowedOrigins).AllowCredentials().AllowAnyHeader().WithMethods("GET", "POST", "PUT", "DELETE");
                else
                    policy.DisallowCredentials();
            });
        });

        // DB context - connection string must come from secure config
        var conn = configuration.GetConnectionString("Postgres");
        if (string.IsNullOrEmpty(conn)) throw new InvalidOperationException("Postgres connection string not found");

        builder.Services.AddDbContext<DatabaseContext>(options => options.UseNpgsql(conn));

        // Enforce security headers at startup via Startup.Start or middleware later.
        Startup.Start(builder);
    }
}