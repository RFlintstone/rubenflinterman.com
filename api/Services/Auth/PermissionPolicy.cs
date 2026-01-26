using Microsoft.AspNetCore.Authorization;
using Api.Constants;

namespace Api.Services.Auth;

// This defines the "What": We are looking for a specific permission string
public class PermissionRequirement : IAuthorizationRequirement
{
    public string PermissionName { get; }
    public PermissionRequirement(string permissionName) => PermissionName = permissionName;
}

// This defines the "How": The logic used to check the user's claims
public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // 1. Get all "permission" claims from the user's JWT
        var userPermissions = context.User.FindAll("permission").Select(x => x.Value).ToList();

        // 2. Logic: User succeeds if they have the specific permission 
        // OR if they have the 'AllAccess' super-permission.
        if (userPermissions.Contains(requirement.PermissionName) || userPermissions.Contains(AuthConstants.Permissions.Names.AllAccess))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}