namespace Api.Models.Users;

public class UserPermissionModel
{
    // Basic Permission Info
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PermissionName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
    
    // URL associated with this permission (if applicable)
    public string? OnUrl { get; set; }
}