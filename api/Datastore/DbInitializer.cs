using System.Text.RegularExpressions;
using Api.Constants;
using Api.Models.Users;
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

        // Update pre-existing users with default properties
        await UpdatePreExistingUsers(context, encryption, avatarService, logger);
        
        // Seed Roles and Permissions
        foreach (var role in AuthConstants.Roles.AllRoles)
        {
            // Add roles to the database if they don't exist
            await AddRoleIfNotExists(context, role);
            
            // Add permissions to the database if they don't exist
            foreach (var permission in role.RolePermissions)
            {
                await AddPermissionIfNotExists(context, permission);
            }
        }

        // Make sure we have all permissions in the DB, even if not tied to a role
        foreach (var permission in AuthConstants.Permissions.AllPermissions)
        {
            await AddPermissionIfNotExists(context, permission);
        }
    }

    private static async Task UpdatePreExistingUsers(DatabaseContext context, EncryptionService encryption,
        AvatarService avatarService, ILogger logger)
    {
        // Find users with default properties
        var usersToUpdate = await context.Users
            .Where(u =>
                u.Username == string.Empty ||
                u.Email == string.Empty ||
                u.Password == string.Empty ||
                u.PhoneNumber == string.Empty ||
                u.Roles.Count == 0 ||
                u.Avatar == string.Empty
            ).Include(userInfoModel => userInfoModel.Roles)
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
                if (user.Roles.Count == 0)
                {
                    logger.LogInformation("Updating roles for user {UserId}", user.Id);
                    user.Roles.Add(AuthConstants.Roles.BannedUser);
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
    
    private static async Task AddRoleIfNotExists(DatabaseContext context, UserRoleModel role)
    {
        var existingRole = await context.UserRoles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.RoleName == role.RoleName);

        if (existingRole == null)
        {
            context.UserRoles.Add(role);
        }
        else
        {
            // Update the code instance ID to match the DB
            role.Id = existingRole.Id;
        
            // Ensure the description is up to date
            existingRole.Description = role.Description;

            // Sync Permissions: Add any missing ones from our static list to the DB role
            foreach (var p in role.RolePermissions)
            {
                if (existingRole.RolePermissions.All(ep => ep.PermissionName != p.PermissionName))
                {
                    existingRole.RolePermissions.Add(p);
                }
            }
        }
        await context.SaveChangesAsync();
    }
    
    private static async Task AddPermissionIfNotExists(DatabaseContext context, UserPermissionModel permission)
    {
        var existing = await context.UserPermissions
            .FirstOrDefaultAsync(p => p.PermissionName == permission.PermissionName);

        if (existing == null)
        {
            context.UserPermissions.Add(permission);
            await context.SaveChangesAsync();
            return;
        }

        // Crucial: Update the code's static ID to match the DB's existing ID
        // This ensures that when we seed Roles later, the relationship works.
        permission.Id = existing.Id;
    }
}