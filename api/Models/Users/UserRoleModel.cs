namespace Api.Models.Users;

public class UserRoleModel
{
    // Basic Role Info
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RoleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    // Permissions associated with this role
    public virtual ICollection<UserPermissionModel> RolePermissions { get; set; } = new List<UserPermissionModel>();
}