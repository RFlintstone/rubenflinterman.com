using Api.Services.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Api.Datastore;

public class DatabaseContextFactory : IDesignTimeDbContextFactory<DatabaseContext>
{
    public DatabaseContext CreateDbContext(string[] args)
    {
        // Load configuration from appsettings.json and environment variables
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        // Get the Postgres connection string
        var connectionString = configuration.GetConnectionString("Postgres");

        // Ensure the connection string is not null or empty
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Postgres connection string not found for design-time");
        }

        // Configure DbContext options
        var optionsBuilder = new DbContextOptionsBuilder<DatabaseContext>();
        optionsBuilder.UseNpgsql(connectionString);

        // Provide a dummy EncryptionService for design-time
        var encryptionService = new EncryptionService(configuration);

        // Create and return the DatabaseContext
        return new DatabaseContext(optionsBuilder.Options, encryptionService, configuration);
    }
}