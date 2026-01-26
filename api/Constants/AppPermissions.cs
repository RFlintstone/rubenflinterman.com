using Api.Models.Users;

namespace Api.Constants;

public static class AuthConstants
{
    // High-level system roles
    public static class Roles
    {
        public static readonly UserRoleModel SuperAdmin = new()
        {
            Id = Guid.NewGuid(),
            RoleName = "Admin",
            Description = "Administrator with full access",
            RolePermissions = new List<UserPermissionModel>
            {
                Permissions.AllAccessInstance
            }
        };

        public static readonly UserRoleModel RegularUser = new()
        {
            Id = Guid.NewGuid(),
            RoleName = "User",
            Description = "Regular user with standard access",
            RolePermissions = new List<UserPermissionModel>() // No special permissions by default
        };

        public static readonly UserRoleModel GuestUser = new()
        {
            Id = Guid.NewGuid(),
            RoleName = "Guest",
            Description = "Guest user with limited access",
            RolePermissions = new List<UserPermissionModel>() // No special permissions by default
        };

        public static readonly UserRoleModel BannedUser = new()
        {
            Id = Guid.NewGuid(),
            RoleName = "Banned",
            Description = "Banned user with no access. This overrides all other roles.",
            RolePermissions = new List<UserPermissionModel>
            {
                Permissions.BannedFromAPIInstance
            }
        };

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
            
            // Storage
            public const string StorageRead = "permissions.storage.read";
            public const string StorageWrite = "permissions.storage.write";
            public const string StorageDelete = "permissions.storage.delete";
            
            // --- Blacklist permission ---
            public const string BannedFromAPI = "permissions.blacklisted.bannedfromapi";
        }

        // --- Super Admin permission ---
        public static readonly UserPermissionModel AllAccessInstance = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.AllAccess,
            Description = "Full access to all system features"
        };
        
        // --- Storage permissions ---
        public static readonly UserPermissionModel StorageReadInstance = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageRead,
            Description = "Permission to read from storage",
            IsEnabled = true
        };
        
        public static readonly UserPermissionModel StorageWriteInstance = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageWrite,
            Description = "Permission to write to storage",
            IsEnabled = true
        };
        
        public static readonly UserPermissionModel StorageDeleteInstance = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.StorageDelete,
            Description = "Permission to delete from storage",
            IsEnabled = true
        };

        // --- Blacklist permission ---
        public static readonly UserPermissionModel BannedFromAPIInstance = new()
        {
            Id = Guid.NewGuid(),
            PermissionName = Names.BannedFromAPI,
            Description = "User is banned from accessing the API",
            IsEnabled = true
        };
        
        // --- List of all permissions ---
        public static readonly List<UserPermissionModel> AllPermissions = new() 
        {
            AllAccessInstance,
            StorageReadInstance,
            StorageWriteInstance,
            StorageDeleteInstance,
            BannedFromAPIInstance
        };
    }
}