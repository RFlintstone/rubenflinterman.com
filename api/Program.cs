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

class Program
{
    static void Main(string[] args)
    {
        // Create the web application.
        var builder = WebApplication.CreateBuilder(args);
        bool isInDocker = builder.Configuration.GetValue<bool>("RUNNING_IN_DOCKER");

        // Configure logging
        builder.Logging.ClearProviders(); // Optional: Clears existing logging providers
        builder.Logging.AddConsole(); // Adds console logging
        builder.Logging.AddDebug(); // Adds debug logging (optional)

        // Ensure the application listens on the correct ports
        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            serverOptions.ListenAnyIP(8080);
            serverOptions.ListenAnyIP(8081);
            serverOptions.ListenAnyIP(3001);
        });


        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Register Endpoints class
        builder.Services.AddScoped<EncryptionService>();
        builder.Services.AddScoped<AuthController>();
        builder.Services.AddScoped<UserInfoService>();

        // Load configuration from appsettings.json
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .Build();

        // Load the X.509 certificate
        if (!isInDocker)
        {
            var certificatePath;
            var certificate;
            try
            {
                certificatePath = Path.Combine(Directory.GetCurrentDirectory(), "certificate.pfx");
                certificate = new X509Certificate2(certificatePath, configuration["Certificate:Key"]);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading certificate: {ex.Message}");
            }
            builder.Services.AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo(@"/keys/"))
                .ProtectKeysWithCertificate(certificate);
        }

        // Add JWT authentication
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["JwtSettings:Issuer"],
                    ValidAudience = configuration["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                        configuration["JwtSettings:SecretKey"] ??
                        throw new InvalidOperationException()))
                };
            });

        // Configure DB context
        builder.Services.AddDbContext<DatabaseContext>(
            options => options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

        // Startup
        Startup.Start(builder);
    }
}