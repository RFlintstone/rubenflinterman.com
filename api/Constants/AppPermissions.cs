using System.Security.Claims;
using Api.Models.Users;

namespace Api.Constants;

public static class AuthConstants
{
    // High-level system roles
    public static class Roles
    {
        // --- User based roles ---
        public static readonly UserRoleModel SuperAdmin = new()
        {
            Id = Guid.NewGuid(),
            RoleName = "Admin",
            Description = "Administrator with full access",
            RolePermissions = new List<UserPermissionModel>
            {
                Permissions.AllAccess
            }
        };

        public static readonly UserRoleModel RegularUser = new()
        {
            Id = Guid.NewGuid(),
            RoleName = "User",
            Description = "Regular user with standard access",
            RolePermissions = new List<UserPermissionModel>
            {
                // Access to storage endpoints
                Permissions.StorageWriteEndpointAccess,
                Permissions.StorageReadEndpointAccess,
                Permissions.StorageDeleteEndpointAccess,

                // Permissions
                Permissions.StorageWritePrivate,
                Permissions.StorageReadOwned,
                Permissions.StorageReadPublic,
                Permissions.StorageDeleteOwned
            }
        };

        public static readonly UserRoleModel GuestUser = new()
        {
            Id = Guid.NewGuid(),
            RoleName = "Guest",
            Description = "Guest user with limited access",
            RolePermissions = new List<UserPermissionModel>() // No special permissions by default
        };

        // --- Permission based roles ---
        public static readonly UserRoleModel BannedUser = new()
        {
            Id = Guid.NewGuid(),
            RoleName = "Banned",
            Description = "Banned user with no access. This overrides all other roles.",
            RolePermissions = new List<UserPermissionModel>
            {
                Permissions.BannedFromApi
            }
        };

        // --- List of all roles ---
        public static readonly List<UserRoleModel> AllRoles = new()
        {
            SuperAdmin,
            RegularUser,
            GuestUser,
            BannedUser
        };
    }

    // Granular permissions for policy-based access
    public static class Permissions
    {
        // --- Names for [Authorize(Policy = ...)] ---
        public static class Names
        {
            // --- Super Admin permission ---
            public const string AllAccess = "permissions.all.access";

            // --- Storage ---
            // Access endpoint
            public const string StorageWriteEndpointAccess = "permissions.storage.access.resource.write";

            public const string StorageReadEndpointAccess = "permissions.storage.access.resource.read";

            // TODO: Add update endpoint access permission when update functionality is implemented
            public const string StorageDeleteEndpointAccess = "permissions.storage.access.resource.delete";

            // 'Global' Write permissions
            public const string StorageWritePublic = "permissions.storage.write.public";
            public const string StorageWritePrivate = "permissions.storage.write.private";
            public const string StorageWriteAll = "permissions.storage.write.*";

            // 'Global' Read permissions
            public const string StorageReadAllPublic = "permissions.storage.read.public";
            public const string StorageReadAllPrivate = "permissions.storage.read.private";
            public const string StorageReadAll = "permissions.storage.read.*";

            // 'Owned' Read permissions
            public const string StorageReadOwned = "permissions.storage.read.owned";

            // TODO: Add Update permissions when update functionality is implemented
            // 'Global' Update permissions
            // 'Owned' Update permission

            // 'Global' Delete permissions
            public const string StorageDeletePublic = "permissions.storage.delete.public";
            public const string StorageDeletePrivate = "permissions.storage.delete.private";
            public const string StorageDeleteAll = "permissions.storage.delete.*";

            // 'Owned' Delete permission
            public const string StorageDeleteOwned = "permissions.storage.delete.owned";

            // --- Blacklist permission ---
            // Banned from all API endpoints
            public const string BannedFromAPI = "permissions.blacklisted.bannedfromapi";
        }

        // --- Super Admin permission ---
        public static readonly UserPermissionModel AllAccess = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.AllAccess,
            Description = "Full access to all system features"
        };

        // --- Storage permissions ---
        // Access endpoint permissions
        public static readonly UserPermissionModel StorageWriteEndpointAccess = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageWriteEndpointAccess,
            Description = "Permission to access storage write endpoints",
            IsEnabled = true
        };

        public static readonly UserPermissionModel StorageReadEndpointAccess = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageReadEndpointAccess,
            Description = "Permission to access storage read endpoints",
            IsEnabled = true
        };

        // TODO: Add update endpoint access permission when update functionality is implemented

        public static readonly UserPermissionModel StorageDeleteEndpointAccess = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageDeleteEndpointAccess,
            Description = "Permission to access storage delete endpoints",
            IsEnabled = true
        };

        // Write permissions
        public static readonly UserPermissionModel StorageWritePublic = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageWritePublic,
            Description = "Permission to write public files to storage",
            IsEnabled = true
        };

        public static readonly UserPermissionModel StorageWritePrivate = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageWritePrivate,
            Description = "Permission to write private files to storage",
            IsEnabled = true
        };

        public static readonly UserPermissionModel StorageWriteAll = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageWriteAll,
            Description = "Permission to write both public and private files to storage",
            IsEnabled = true
        };

        // Read permissions
        public static readonly UserPermissionModel StorageReadPublic = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageReadAllPublic,
            Description = "Permission to read public files from storage",
            IsEnabled = true
        };

        public static readonly UserPermissionModel StorageReadPrivate = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageReadAllPrivate,
            Description = "Permission to read private files from storage",
            IsEnabled = true
        };

        public static readonly UserPermissionModel StorageReadAll = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageReadAll,
            Description = "Permission to read all files from storage, no matter the privacy setting",
            IsEnabled = true
        };

        public static readonly UserPermissionModel StorageReadOwned = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageReadOwned,
            Description = "Permission to read owned files from storage",
            IsEnabled = true
        };

        // Update permissions
        // TODO: Add update permissions when update functionality is implemented

        // Delete permissions
        public static readonly UserPermissionModel StorageDeletePublic = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageDeletePublic,
            Description = "Permission to delete public files from storage",
            IsEnabled = true
        };

        public static readonly UserPermissionModel StorageDeletePrivate = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageDeletePrivate,
            Description = "Permission to delete private files from storage",
            IsEnabled = true
        };

        public static readonly UserPermissionModel StorageDeleteAll = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageDeleteAll,
            Description = "Permission to delete both public and private files from storage",
            IsEnabled = true
        };

        public static readonly UserPermissionModel StorageDeleteOwned = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageDeleteOwned,
            Description = "Permission to delete owned files from storage",
            IsEnabled = true
        };

        // --- Blacklist permission ---
        public static readonly UserPermissionModel BannedFromApi = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.BannedFromAPI,
            Description = "User is banned from accessing the API",
            IsEnabled = true
        };

        // --- List of all permissions ---
        public static readonly List<UserPermissionModel> AllPermissions = new()
        {
            // --- Access endpoint permissions ---
            StorageWriteEndpointAccess,
            StorageReadEndpointAccess,
            // TODO: Add update endpoint access permission when update functionality is implemented
            StorageDeleteEndpointAccess,
            
            // --- Super Admin permission ---
            AllAccess,

            // --- Storage permissions ---
            // Write
            StorageWritePublic,
            StorageWritePrivate,
            StorageWriteAll,

            // Read
            StorageReadPublic,
            StorageReadPrivate,
            StorageReadAll,
            StorageReadOwned,

            // Update
            // TODO: Add update permissions when update functionality is implemented

            // Delete
            StorageDeletePublic,
            StorageDeletePrivate,
            StorageDeleteAll,
            StorageDeleteOwned,

            // --- Blacklist permissions ---
            BannedFromApi
        };
    }

    public static bool HasPermission(this ClaimsPrincipal user, string permission)
    {
        if (user.HasClaim(c => c.Type == "permission" && c.Value == Permissions.Names.BannedFromAPI))
        {
            return false;
        }

        if (user.HasClaim(c => c.Type == "permission" && c.Value == Permissions.Names.AllAccess))
        {
            return true;
        }

        return user.HasClaim(c => c.Type == "permission" && c.Value == permission);
    }
}