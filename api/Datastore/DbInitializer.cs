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
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;

        var context = services.GetRequiredService<DatabaseContext>();
        var encryption = services.GetRequiredService<EncryptionService>();
        var avatarService = services.GetRequiredService<AvatarService>();
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("DbInitializer");

        // Migrate
        await context.Database.MigrateAsync();

        // Seed Permissions
        foreach (var permission in AuthConstants.Permissions.AllPermissions)
        {
            await AddPermissionIfNotExists(context, permission);
        }

        // Seed Roles
        foreach (var role in AuthConstants.Roles.AllRoles)
        {
            await AddRoleIfNotExists(context, role);
        }

        // Update Users
        await UpdatePreExistingUsers(context, encryption, avatarService, logger);
    }

    private static async Task UpdatePreExistingUsers(DatabaseContext context, EncryptionService encryption,
        AvatarService avatarService, ILogger logger)
    {
        var usersToUpdate = await context.Users
            .Where(u =>
                u.Username == string.Empty ||
                u.Email == string.Empty ||
                u.Password == string.Empty ||
                u.PhoneNumber == string.Empty ||
                u.Roles.Count == 0 ||
                u.Avatar == string.Empty
            ).Include(u => u.Roles)
            .ToListAsync();

        if (!usersToUpdate.Any()) return;

        // Fetch the actual tracked Banned Role instance once to reuse
        var bannedRole = await context.UserRoles
            .FirstOrDefaultAsync(r => r.RoleName == AuthConstants.Roles.BannedUser.RoleName);

        foreach (var user in usersToUpdate)
        {
            if (CrlfRegex.IsMatch(user.Username))
            {
                user.Username = CrlfRegex.Replace(user.Username, "");
            }

            if (user.Username == string.Empty)
            {
                var tempId = user.Id.ToString();
                user.Username = $"user-{(tempId.Length < 8 ? Guid.NewGuid().ToString()[..8] : tempId[..8])}";
            }

            if (user.Email == string.Empty)
                user.Email = $"{user.Username.ToLower()}@user.com";

            if (user.Password == string.Empty)
            {
                string plainPassword = user.Username.ToLower();
                user.Password = Convert.ToBase64String(encryption.Encrypt(plainPassword, user.Id));
            }

            if (user.PhoneNumber == string.Empty)
                user.PhoneNumber = "000-000-0000";

            // FIX: Use the tracked instance, not the static constant
            if (user.Roles.Count == 0 && bannedRole != null)
            {
                logger.LogInformation("Assigning Banned role to user {UserId}", user.Id);
                user.Roles.Add(bannedRole);
            }

            if (user.Avatar == string.Empty)
                user.Avatar = await avatarService.GetDefaultAvatarBase64Async(user.Username);

            user.LastLogin = DateTime.MinValue;
            user.RefreshToken = Guid.Empty.ToString();
            user.RefreshTokenCreated = DateTime.MinValue;
            user.RefreshTokenExpiry = DateTime.MinValue;
        }

        await context.SaveChangesAsync();
    }

    private static async Task AddRoleIfNotExists(DatabaseContext context, UserRoleModel role)
    {
        var existingRole = await context.UserRoles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.RoleName == role.RoleName);

        if (existingRole == null)
        {
            // We need to ensure the permissions attached to this new role 
            // are also tracked instances from the DB
            var trackedPermissions = new List<UserPermissionModel>();
            foreach (var p in role.RolePermissions)
            {
                var dbPermission = await context.UserPermissions
                    .FirstAsync(dp => dp.PermissionName == p.PermissionName);
                trackedPermissions.Add(dbPermission);
            }

            role.RolePermissions = trackedPermissions;
            context.UserRoles.Add(role);
        }
        else
        {
            existingRole.Description = role.Description;
            foreach (var p in role.RolePermissions)
            {
                if (existingRole.RolePermissions.All(ep => ep.PermissionName != p.PermissionName))
                {
                    var dbPermission = await context.UserPermissions
                        .FirstAsync(dp => dp.PermissionName == p.PermissionName);
                    existingRole.RolePermissions.Add(dbPermission);
                }
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task AddPermissionIfNotExists(DatabaseContext context, UserPermissionModel permission)
    {
        var exists = await context.UserPermissions
            .AnyAsync(p => p.PermissionName == permission.PermissionName);

        if (!exists)
        {
            context.UserPermissions.Add(permission);
            await context.SaveChangesAsync();
        }
    }
}