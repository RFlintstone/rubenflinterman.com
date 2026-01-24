using System;
using System.Collections;
using System.IO;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.RegularExpressions;
using Api.Controllers.Auth;
using Api.Datastore;
using Api.Services.Auth;
using Api.Services.Users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.Features;
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
            keyPath = Directory.Exists(dockerKeysPath)
                ? dockerKeysPath
                : Path.Combine(Directory.GetCurrentDirectory(), "keys");
        }

        Directory.CreateDirectory(keyPath);

        // Normalize and sanitize keypath
        var sanitizedKeyPath = Path.GetFullPath(keyPath);

        // Restrict to a base directory (HIGHLY recommended)
        var allowedBasePathKeys = Path.GetFullPath("/app/keys");

        if (!sanitizedKeyPath.StartsWith(allowedBasePathKeys, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Invalid DataProtection key path.");
        }

        // Ensure directory exists
        Directory.CreateDirectory(sanitizedKeyPath);

        var dpBuilder = builder.Services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo(sanitizedKeyPath))
            .SetApplicationName(configuration["DataProtection:AppName"] ?? "Api-Prod");

        // Define the strictly allowed secrets directory
        var secretsFolder = "/run/secrets/"; 

        // Prefer certificate from a secure store / secret manager. Password should be provided via config
        var certificatePath = configuration["Certificate:Path"];
        
        // Prefer configuration value populated from `*_FILE` mapping; fall back to legacy env var if present
        var certificatePassword = configuration["Certificate:Password"] ?? Environment.GetEnvironmentVariable("CERT_PASSWORD");
        
        // Remove any path traversal and force it to be within the secrets folder
        if (!string.IsNullOrEmpty(certificatePath))
        {
            // Snyk-style: strip everything but alphanumeric, underscores, and dots (for .pfx)
            var safeFileName = Regex.Replace(Path.GetFileName(certificatePath), "[^a-zA-Z0-9._-]", "");
            certificatePath = Path.Combine(secretsFolder, safeFileName);
        }
        
        if (!string.IsNullOrEmpty(certificatePath) && File.Exists(certificatePath) && !string.IsNullOrEmpty(certificatePassword))
        {
            try
            {
                var cert = new X509Certificate2(certificatePath, certificatePassword,
                    X509KeyStorageFlags.EphemeralKeySet);
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
                logger.LogWarning(
                    "No certificate configured for key protection and not running on Windows; ensure key storage is protected and persistent (Redis/Azure Blob recommended).");
            }
        }
    }

    private static void ConfigureJwtAuthentication(WebApplicationBuilder builder, IConfiguration configuration)
    {
        // Prefer secrets from configuration which may have been populated by the *_FILE mapping
        var jwtSecretKey = configuration["JwtSettings:SecretKey"] ?? Environment.GetEnvironmentVariable("JWT_SECRET");
        var jwtIssuer = configuration["JwtSettings:Issuer"] ?? Environment.GetEnvironmentVariable("JWT_ISSUER");
        var jwtAudience = configuration["JwtSettings:Audience"] ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE");

        if (string.IsNullOrEmpty(jwtSecretKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
        {
            throw new InvalidOperationException(
                "JWT configuration incomplete. Use environment/secret store to provide secrets.");
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
    
    public static async Task Main(string[] args) // Changed to async Task
    {
        var builder = WebApplication.CreateBuilder(args);

        LoadFileEnvironmentVariablesIntoConfiguration(builder.Configuration);
        var configuration = builder.Configuration;

        // --- SERVICES ---
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddHttpClient();

        // Register services
        builder.Services.AddScoped<AvatarService>();
        builder.Services.AddScoped<EncryptionService>();
        builder.Services.AddScoped<UserInfoService>();

        // DB Context
        var conn = configuration.GetConnectionString("Postgres");
        builder.Services.AddDbContext<DatabaseContext>(options =>
            options.UseNpgsql(conn)
                .ConfigureWarnings(w =>
                    w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning))
        );
        
        // Increase the default limits for large file uploads (e.g., 1024 MB)
        builder.WebHost.ConfigureKestrel(options =>
        {
            options.Limits.MaxRequestBodySize = 1073741824;
        });
        builder.Services.Configure<FormOptions>(options =>
        {
            options.MultipartBodyLengthLimit = 1073741824;
            options.ValueLengthLimit = int.MaxValue;
        });

        ConfigureCertificateProtection(builder, configuration);
        ConfigureJwtAuthentication(builder, configuration);

        // --- BUILD ---
        var app = builder.Build();

        // --- DATABASE INITIALIZATION ---
        if (configuration.GetValue<bool>("RUNNING_IN_DOCKER") || app.Environment.IsDevelopment())
        {
            // Use the seeder we created in the previous step
            await DbInitializer.InitializeAsync(app.Services);
        }

        // --- PIPELINE ---
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        await app.RunAsync();
    }
}