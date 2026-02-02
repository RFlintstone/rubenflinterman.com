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

    /// <summary>
    /// Generates a JWT access token for the specified user and roles.
    /// </summary>
    /// <param name="user"></param>
    /// <param name="roles"></param>
    /// <returns></returns>
    /// <exception cref="InvalidOperationException"></exception>
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
            var userPermissions =
                user.Roles.SelectMany(r => r.RolePermissions).Select(p => p.PermissionName).Distinct();

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

    public record TokenInspectionResult(
        bool IsValid,
        bool IsExpired,
        ClaimsPrincipal? Principal,
        JwtSecurityToken? Jwt);

    public TokenInspectionResult ValidateOrInspectToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("Token inspection failed: token is null or empty.");
            return new TokenInspectionResult(false, false, null, null);
        }

        token = token.Trim();
        const string bearerPrefix = "Bearer ";
        if (token.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            token = token.Substring(bearerPrefix.Length).Trim();
        }

        var secretKey = _configuration["JwtSettings:SecretKey"];
        var issuer = _configuration["JwtSettings:Issuer"];
        var audience = _configuration["JwtSettings:Audience"];

        var tokenHandler = new JwtSecurityTokenHandler();
        if (!tokenHandler.CanReadToken(token))
        {
            _logger.LogWarning("Token inspection failed: token is not in JWS/JWE compact form.");
            return new TokenInspectionResult(false, false, null, null);
        }

        var key = Encoding.UTF8.GetBytes(secretKey);

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };

        try
        {
            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
            return new TokenInspectionResult(true, false, principal, (JwtSecurityToken)validatedToken!);
        }
        catch (SecurityTokenExpiredException)
        {
            // Token expired -> extract principal without lifetime validation
            try
            {
                var principal = GetPrincipalFromExpiredToken(token);
                var jwt = tokenHandler.ReadJwtToken(token);
                return new TokenInspectionResult(false, true, principal, jwt);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to extract principal from expired token.");
                return new TokenInspectionResult(false, true, null, null);
            }
        }
        catch (SecurityTokenMalformedException)
        {
            // malformed token
            _logger.LogWarning("Token inspection failed: malformed token.");
            return new TokenInspectionResult(false, false, null, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token inspection failed.");
            return new TokenInspectionResult(false, false, null, null);
        }
    }

    public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("GetPrincipalFromExpiredToken called with null or empty token.");
            throw new SecurityTokenMalformedException("Token is null or empty.");
        }

        token = token.Trim();
        const string bearerPrefix = "Bearer ";
        if (token.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            token = token.Substring(bearerPrefix.Length).Trim();
        }

        var secretKey = _configuration["JwtSettings:SecretKey"];
        var tokenHandler = new JwtSecurityTokenHandler();

        if (!tokenHandler.CanReadToken(token))
        {
            _logger.LogWarning("GetPrincipalFromExpiredToken failed: token is not in JWS/JWE compact form.");
            throw new SecurityTokenMalformedException("JWT is not well formed.");
        }

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = false // allow expired tokens
        };

        var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
        return principal;
    }
}