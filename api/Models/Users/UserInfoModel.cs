namespace Api.Models.Users;

public class UserInfoModel
{
    // Basic Profile Info
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string[] Roles { get; set; } = { "User" };
    public string Avatar { get; set; } = "default";

    // Authentication State
    public DateTime LastLogin { get; set; } = DateTime.UtcNow;
    
    // RENAMED: This is the 'Refresh Token' used to get new JWTs
    public string? RefreshToken { get; set; } 
    public DateTime RefreshTokenCreated { get; set; } = DateTime.UtcNow;
    public DateTime RefreshTokenExpiry { get; set; }
}