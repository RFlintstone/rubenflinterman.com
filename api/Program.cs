using System.Security.Cryptography.X509Certificates;
using System.Text;
using Api.Controllers.Auth;
using Api.Datastore;
using Api.Services.Auth;
using Api.Services.Users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Api;

public class Program
{
    private static void ConfigureCertificateProtection(WebApplicationBuilder builder, IConfiguration configuration)
    {
        var certificatePath = Path.Combine(Directory.GetCurrentDirectory(), "certificate.pfx");
        var certificateKey = configuration["Certificate:Key"] ?? 
            throw new InvalidOperationException("Certificate key not found in configuration");

        try
        {
            var certificate = new X509Certificate2(certificatePath, certificateKey);
            
            builder.Services.AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo("/keys/"))
                .ProtectKeysWithCertificate(certificate);
                
            var logger = LoggerFactory.Create(config => config.AddConsole())
                                    .CreateLogger(typeof(Program));
            logger.LogInformation("Certificate loaded successfully from {Path}", certificatePath);
        }
        catch (Exception ex)
        {
            var logger = LoggerFactory.Create(config => config.AddConsole())
                                    .CreateLogger(typeof(Program));
            logger.LogError(ex, "Failed to load certificate from {Path}", certificatePath);
            throw;
        }
    }

    private static void ConfigureJwtAuthentication(WebApplicationBuilder builder, IConfiguration configuration)
    {
        var jwtSecretKey = configuration["JwtSettings:SecretKey"] ?? 
            throw new InvalidOperationException("JWT secret key not found in configuration");
            
        var jwtIssuer = configuration["JwtSettings:Issuer"] ?? 
            throw new InvalidOperationException("JWT issuer not found in configuration");
            
        var jwtAudience = configuration["JwtSettings:Audience"] ?? 
            throw new InvalidOperationException("JWT audience not found in configuration");

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSecretKey))
                };
            });
    }

    public static void Main(string[] args)
    {
        // Create the web application.
        var builder = WebApplication.CreateBuilder(args);
        var isInDocker = builder.Configuration.GetValue<bool>("RUNNING_IN_DOCKER");

        // Configure logging
        builder.Logging.ClearProviders();
        builder.Logging.AddConsole();
        builder.Logging.AddDebug();

        // Ensure the application listens on the correct ports
        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            serverOptions.ListenAnyIP(8080);
            serverOptions.ListenAnyIP(8081);
            serverOptions.ListenAnyIP(3001);
        });

        // Add services to the container.
        builder.Services.AddAntiforgery();
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Register services
        builder.Services.AddScoped<EncryptionService>();
        builder.Services.AddScoped<AuthController>();
        builder.Services.AddScoped<UserInfoService>();

        // Configure certificate-based protection
        if (!isInDocker)
        {
            ConfigureCertificateProtection(builder, builder.Configuration);
        }
        else
        {
            // In Docker, use a simpler data protection setup
            builder.Services.AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo("/app/keys/"));
        }

        // Add JWT authentication
        ConfigureJwtAuthentication(builder, builder.Configuration);

        // Configure DB context
        builder.Services.AddDbContext<DatabaseContext>(
            options => options.UseNpgsql(
                builder.Configuration.GetConnectionString("Postgres") ?? 
                throw new InvalidOperationException("Postgres connection string not found")));

        // Call Startup.Start to handle the rest of the configuration and run the app
        Startup.Start(builder);
    }
}
