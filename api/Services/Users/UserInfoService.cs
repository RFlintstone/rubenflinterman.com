using System.Security.Claims;
using System.Text;
using Api.Datastore;
using Api.Models.Users;
using Microsoft.EntityFrameworkCore;

namespace Api.Services.Users;

public class UserInfoService : IUserInfoService
{
    private readonly UserInfoModel _userInfo = new();
    private readonly DatabaseContext _dbContext;

    public UserInfoService(DatabaseContext dbContext)
    {
        _dbContext = dbContext;
    }

    //========================================
    //                  Get                  |
    //========================================
    public Guid GetId() => _userInfo.Id;
    public string GetUsername() => _userInfo.Username;
    public string GetEmail() => _userInfo.Email;
    public string GetPassword() => _userInfo.Password;
    public string GetToken() => _userInfo.RefreshToken;
    public string[] GetRoles() => _userInfo.Roles;
    public string GetAvatar() => _userInfo.Avatar;

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

    public async Task<bool> SetEmail(ClaimsPrincipal? claimsPrincipal)
    {
        // Get the ID from the JWT
        var idValue = claimsPrincipal?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(idValue, out var userId)) return false;

        // Look up the user in the DB (only fetch the Avatar column for speed)
        var email = await _dbContext.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => u.Email)
            .FirstOrDefaultAsync();

        // If we have an email, set it and return true
        if (email is not null)
        {
            _userInfo.Email = email;
            return true;
        }

        // If there's no email, set a default value and return false
        _userInfo.Email = "default";
        return false;
    }

    public bool SetPassword(string password)
    {
        _userInfo.Password = password;
        return _userInfo.Password != "default";
    }

    public bool SetToken(string token)
    {
        _userInfo.RefreshToken = token;
        return _userInfo.RefreshToken != "default";
    }

    public bool SetRoles(ClaimsPrincipal? claimsPrincipal)
    {
        // Set claims
        var claims = claimsPrincipal?.Claims;

        // Check if we have any claims on the user
        if (claims is null) return false;

        // Select all role claims and convert them to a string array
        var roles = claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToArray();

        // Set roles in _userInfo, default to a single "User" role if none are found
        _userInfo.Roles = roles.Length > 0 ? roles : new[] { "User" };

        // Return true if we have any roles other than the default "User" role
        return _userInfo.Roles.Any(role => role != "User");
    }

    public async Task<bool> SetAvatarAsync(ClaimsPrincipal? claimsPrincipal)
    {
        // Get the ID from the JWT
        var idValue = claimsPrincipal?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(idValue, out var userId)) return false;

        // Look up the user in the DB (only fetch the Avatar column for speed)
        var avatar = await _dbContext.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => u.Avatar)
            .FirstOrDefaultAsync();

        // If we have an avatar, set it and return true
        if (avatar is not null)
        {
            _userInfo.Avatar = avatar;
            return true;
        }

        // If there's no avatar, set a default value and return false
        _userInfo.Avatar = string.Empty;
        return false;
    }
}