using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Models.Users;
using Microsoft.IdentityModel.Tokens;

namespace Api.Services.Auth;

public class AuthTokenService
{
    private readonly ILogger<AuthTokenService> _logger;
    private readonly IConfiguration _configuration;

    public AuthTokenService(ILoggerFactory loggerFactory, IConfiguration configuration)
    {
        _logger = loggerFactory.CreateLogger<AuthTokenService>(); // Create the logger here
        _configuration = configuration;
    }

    // Generating token based on user information
    public JwtSecurityToken GenerateAccessToken(UserInfoModel user, string[] roles)
    {
        try
        {
            var userId = user.Id;
            var userName = user.Username;

            // Log token request
            if (_logger.IsEnabled(LogLevel.Information))
            {
                _logger.LogInformation("Generating access token @ {timestamp}", DateTime.UtcNow);
            }

            // Create user claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, userName),
                // Additional claims as needed (e.g., roles, etc.)
            };
            
            // Add a separate Claim for each role
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
            
            // Find user permissions
            var userPermissions = user.Roles.SelectMany(r => r.RolePermissions).Select(p => p.PermissionName).Distinct();
            
            // Add a separate Claim for each permission
            claims.AddRange(userPermissions.Select(permission => new Claim("permission", permission)));
            
            // Get config
            var issuer = _configuration["JwtSettings:Issuer"];
            var audience = _configuration["JwtSettings:Audience"];
            var secretKey = _configuration["JwtSettings:SecretKey"];
            
            // Check if we have all config values
            if (string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience) || string.IsNullOrEmpty(secretKey))
            {
                _logger.LogError("JWT settings are not correctly configured.");
                throw new InvalidOperationException("JWT settings are missing.");
            }

            // Create a JWT
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60), // Adjust as needed
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                    SecurityAlgorithms.HmacSha256
                )
            );

            // Log token generation, if information logging is enabled
            if (_logger.IsEnabled(LogLevel.Information))
            {
                _logger.LogInformation("Access token generated @ {timestamp}", DateTime.UtcNow);
            }

            // Return token
            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while generating the JWT.");
            throw;
        }
    }
}