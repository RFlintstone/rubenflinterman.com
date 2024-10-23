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

    // SET Methods
    bool SetId(ClaimsPrincipal? claimsPrincipal);
    bool SetUsername(ClaimsPrincipal? claimsPrincipal);
    bool SetEmail(string email);
    bool SetPassword(string password);
    bool SetToken(string token);
}