using System.Security.Claims;
using Api.Models.Users;

namespace Api.Services.Users;

public class UserInfoService : IUserInfoService
{
    private readonly UserInfoModel _userInfo;

    public UserInfoService()
    {
        _userInfo = new UserInfoModel(); // Initialize the model
    }

    //========================================
    //                  Get                  |
    //========================================
    public Guid GetId() => _userInfo.Id;
    public string GetUsername() => _userInfo.Username;
    public string GetEmail() => _userInfo.Email;
    public string GetPassword() => _userInfo.Password;
    public string GetToken() => _userInfo.Token;

    //========================================
    //                  Set                  |
    //========================================
    public bool SetId(ClaimsPrincipal? claimsPrincipal)
    {
        // Set claims
        var claims = claimsPrincipal?.Claims;

        // Check if we have any claims on the user
        if (claims is null) return false;

        // Select the first available type name of our claim, this is the username
        var user = claims
            .Select(c => new { c.Type, c.Value })
            .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        
        // If we have a username set it and return true
        _userInfo.Id = new Guid(user?.Value ?? string.Empty);
        return true;
    }

    /// <summary>
    /// Set username based on JWT token (user claim)
    /// </summary>
    /// <param name="claimsPrincipal">The ClaimsPrincipal from the user associated with the executing action.</param>
    /// <returns>Username (string) or fallback value (string)</returns>
    public bool SetUsername(ClaimsPrincipal? claimsPrincipal)
    {
        // Set claims
        var claims = claimsPrincipal?.Claims;

        // Check if we have any claims on the user
        if (claims is null) return false;

        // Select the first available type name of our claim, this is the username
        var user = claims
            .Select(c => new { c.Type, c.Value })
            .FirstOrDefault(c => c.Type == ClaimTypes.Name);

        // If we have a username set it and return true
        _userInfo.Username = user?.Value ?? "default";
        return _userInfo.Username != "default";
    }

    public bool SetEmail(string email)
    {
        _userInfo.Email = email;
        return _userInfo.Email != "default";
    }

    public bool SetPassword(string password)
    {
        _userInfo.Password = password;
        return _userInfo.Password != "default";
    }

    public bool SetToken(string token)
    {
        _userInfo.Token = token;
        return _userInfo.Token != "default";
    }
}