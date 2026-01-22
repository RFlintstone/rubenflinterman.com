using Api.Datastore;
using Api.Services.Auth;
using Api.Services.Users;
using Microsoft.EntityFrameworkCore;

namespace Api.Datastore;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        // Create a new scope to retrieve scoped services
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        
        // Retrieve the required services
        var context = services.GetRequiredService<DatabaseContext>();
        var encryption = services.GetRequiredService<EncryptionService>();
        var avatarService = services.GetRequiredService<AvatarService>();

        // Execute any pending migrations
        await context.Database.MigrateAsync();

        // Find users with default properties
        var usersToUpdate = await context.Users
            .Where(u => 
                u.Password == "" || 
                u.Avatar == "default"
                )
            .ToListAsync();

        // Update each user with default properties
        if (usersToUpdate.Any())
        {
            foreach (var user in usersToUpdate)
            {
                // Encrypt the password (using the username as the temporary password)
                // e.g., Admin user gets password "admin"
                string plainPassword = user.Username.ToLower();
                user.Password = Convert.ToBase64String(encryption.Encrypt(plainPassword, user.Id));

                // Fetch the actual avatar from the external API
                user.Avatar = await avatarService.GetDefaultAvatarBase64Async(user.Username);
                
                // Set a timestamp
                user.LastLogin = DateTime.UtcNow;
            }

            // Save changes for all updated users
            await context.SaveChangesAsync();
        }
    }
}