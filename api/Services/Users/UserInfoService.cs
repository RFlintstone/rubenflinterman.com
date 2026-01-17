using System.Security.Claims;
using System.Text;
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

    public bool SetEmail(ClaimsPrincipal? claimsPrincipal)
    {
        // Set claims
        var claims = claimsPrincipal?.Claims;

        // Check if we have any claims on the user
        if (claims is null) return false;

        // Select the first available type name of our claim, this is the username
        var user = claims
            .Select(c => new { c.Type, c.Value })
            .FirstOrDefault(c => c.Type == ClaimTypes.Email);
        
        // If we have a username set it and return true
        _userInfo.Email = user?.Value ?? "default";
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
        // Get username from claims
        var user = claimsPrincipal?.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

        // Check if we have any claims on the user
        if (string.IsNullOrEmpty(user)) return false;

        // Image properties
        var imageType = "letter"; // 'letter' or 'shape'
        var imageSize = 128;      // min 16, max 360
        var base64Identifier = Convert.ToBase64String(Encoding.UTF8.GetBytes(user));

        // Build URL
        var url = $"https://avi.avris.it/{imageType}-{imageSize}/{base64Identifier}.png";
        
        using var httpClient = new HttpClient();
        try
        {
            // Download image bytes and store as Base64 string
            var bytes = await httpClient.GetByteArrayAsync(url);
            _userInfo.Avatar = bytes.Length > 0 ? Convert.ToBase64String(bytes) : "default";
            return true; // succeeded
        }
        catch
        {
            // Could not fetch avatar
            _userInfo.Avatar = "default";
            return false;
        }
    }
}