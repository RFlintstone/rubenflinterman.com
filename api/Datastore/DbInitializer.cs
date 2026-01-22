using Api.Datastore;
using Api.Services.Auth;
using Api.Services.Users;
using Microsoft.EntityFrameworkCore;

namespace Api.Datastore;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        
        var context = services.GetRequiredService<DatabaseContext>();
        var encryption = services.GetRequiredService<EncryptionService>();
        var avatarService = services.GetRequiredService<AvatarService>();

        // 1. Ensure the database is created and up to date
        // This executes the migrations you see in your /Migrations folder
        await context.Database.MigrateAsync();

        // 2. Look for the seeded users that need "Hydration" 
        // (Users created in OnModelCreating that have empty passwords/default avatars)
        var usersToUpdate = await context.Users
            .Where(u => u.Password == "" || u.Avatar == "default")
            .ToListAsync();

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
                
                // Set a proper timestamp
                user.LastLogin = DateTime.UtcNow;
            }

            await context.SaveChangesAsync();
        }
    }
}