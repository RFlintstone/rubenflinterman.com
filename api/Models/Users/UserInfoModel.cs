namespace Api.Models.Users;

public class UserInfoModel
{
    // User info
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = "Unknown User";
    public string Email { get; set; } = "Unknown Email";
    public string Password { get; set; } = "Unknown Password";
    public string PhoneNumber { get; set; } = "Unknown Phone";
    public string[] Roles { get; set; } = { "User" };

    // User login properties
    public DateTime LastLogin { get; set; } = DateTime.UtcNow;
    public string Token { get; set; } = "Unknown Token";
    public DateTime TokenCreated { get; set; } = DateTime.UtcNow;
    public DateTime TokenExpiry { get; set; } = DateTime.UtcNow;
}