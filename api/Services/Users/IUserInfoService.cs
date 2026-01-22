using System.Security.Claims;

namespace Api.Services.Users;

public interface IUserInfoService
{
    // GET Methods
    public Guid GetId();
    public string GetUsername();
    public string GetEmail();
    public string GetPassword();
    public string GetToken();
    public string GetAvatar();

    // SET Methods
    bool SetId(ClaimsPrincipal? claimsPrincipal);
    bool SetUsername(ClaimsPrincipal? claimsPrincipal);
    Task<bool> SetEmail(ClaimsPrincipal? claimsPrincipal);
    bool SetPassword(string password);
    bool SetToken(string token);
    Task<bool> SetAvatarAsync(ClaimsPrincipal? claimsPrincipal);
}