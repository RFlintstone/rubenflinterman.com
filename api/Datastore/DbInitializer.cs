using System.Text.RegularExpressions;
using Api.Services.Auth;
using Api.Services.Users;
using Microsoft.EntityFrameworkCore;

namespace Api.Datastore;

public static class DbInitializer
{
    private static readonly Regex CrlfRegex = new(@"[\r\n]", RegexOptions.Compiled);
    
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        // Create a new scope to retrieve scoped services
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        
        // Retrieve the required services
        var context = services.GetRequiredService<DatabaseContext>();
        var encryption = services.GetRequiredService<EncryptionService>();
        var avatarService = services.GetRequiredService<AvatarService>();
        
        // Set up logging
        var loggerFactory = services.GetRequiredService<ILoggerFactory>();
        var logger = loggerFactory.CreateLogger("DbInitializer");
        
        // Execute any pending migrations
        await context.Database.MigrateAsync();

        // Find users with default properties
        var usersToUpdate = await context.Users
            .Where(u =>
                u.Username == string.Empty ||
                u.Email == string.Empty ||
                u.Password == string.Empty ||
                u.PhoneNumber == string.Empty ||
                u.Roles.Length == 0 ||
                u.Avatar == string.Empty
                )
            .ToListAsync();

        // Update each pre-existing user with default properties
        if (usersToUpdate.Any())
        {
            foreach (var user in usersToUpdate)
            {
                // Sanitize username to prevent CRLF injection
                if (CrlfRegex.IsMatch(user.Username))
                {
                    logger.LogInformation("Sanitizing username for user {UserId}", user.Id);
                    user.Username = CrlfRegex.Replace(user.Username, "");
                }
                
                // Update username if somehow empty
                if (user.Username == string.Empty)
                {
                    logger.LogInformation("Updating username for user {UserId}", user.Id);

                    var tempId = user.Id.ToString();
                    if (tempId.Length < 8) tempId = Guid.NewGuid().ToString();
                    
                    user.Username = $"user-{tempId[..8]}";
                }
                
                // Set default email if empty
                if (user.Email == string.Empty)
                {
                    logger.LogInformation("Updating email for user {UserId}", user.Id);
                    user.Email = $"{user.Username.ToLower()}@user.com";
                }
                
                // Set default password if empty
                if (user.Password == string.Empty)
                {
                    logger.LogInformation("Updating password for user {UserId}", user.Id);
                    string plainPassword = user.Username.ToLower();
                    user.Password = Convert.ToBase64String(encryption.Encrypt(plainPassword, user.Id));
                }
                
                // Set default phone number if empty
                if (user.PhoneNumber == string.Empty)
                {
                    logger.LogInformation("Updating phone number for user {UserId}", user.Id);
                    user.PhoneNumber = "000-000-0000";
                }
                
                // Set default role if none assigned
                if (user.Roles.Length == 0)
                {
                    logger.LogInformation("Updating roles for user {UserId}", user.Id);
                    user.Roles = new[] { "Banned_From_API" };
                }
                
                if (user.Avatar == string.Empty)
                {
                    logger.LogInformation("Updating avatar for user {UserId}", user.Id);
                    user.Avatar = await avatarService.GetDefaultAvatarBase64Async(user.Username);
                }
                
                // Set a timestamp
                user.LastLogin = DateTime.MinValue;
                
                // Set refresh token fields
                user.RefreshToken = Guid.Empty.ToString();
                user.RefreshTokenCreated = DateTime.MinValue;
                user.RefreshTokenExpiry = DateTime.MinValue;
            }

            // Save changes for all updated users
            await context.SaveChangesAsync();
        }
    }
}