using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using Api.Datastore;
using Api.Models.Auth;
using Api.Services.Auth;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers.Auth;

[Route("api/v1/[controller]")]
public class TokenController : ControllerBase
{
    private readonly DatabaseContext _dbContext;
    private readonly ILogger<TokenController> _logger;
    private readonly AuthTokenService _authTokenService;
    private readonly EncryptionService _encryptionService;

    public TokenController(DatabaseContext dbContext, ILogger<TokenController> logger, ILoggerFactory loggerFactory,
        IConfiguration configuration)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _authTokenService = new AuthTokenService(loggerFactory, configuration);
        _encryptionService = new EncryptionService(configuration);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] TokenExchangeModel model)
    {
        // Get the user by the provided Refresh Token
        var user = await _dbContext.Users
            .Include(u => u.Roles)
            .ThenInclude(r => r.RolePermissions)
            .FirstOrDefaultAsync(u => u.RefreshToken == model.RefreshToken);

        // Check if the user exists and the Refresh Token is still valid
        if (user is null || user.RefreshTokenExpiry < DateTime.UtcNow)
        {
            return Unauthorized("Session expired.");
        }

        // Generate New Access Token (JWT)
        var jwt = _authTokenService.GenerateAccessToken(
            user,
            user.Roles.Select(r => r.RoleName).ToArray()
        );
        var jwtString = new JwtSecurityTokenHandler().WriteToken(jwt);

        // Issue a new Refresh Token so the old one can't be reused
        var bytes = new byte[128];
        RandomNumberGenerator.Fill(bytes);
        user.RefreshToken = Convert.ToBase64String(bytes);
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        // Save changes to the database
        await _dbContext.SaveChangesAsync();

        // Return the new tokens to the client
        return Ok(new
        {
            AccessToken = jwtString,
            RefreshToken = user.RefreshToken,
            ExpiresInSeconds = (int)(jwt.ValidTo - DateTime.UtcNow).TotalSeconds
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthLoginModel model)
    {
        // Find the provided user by email (Async to keep the API responsive)
        var user = await _dbContext.Users
            .Include(u => u.Roles)
            .ThenInclude(r => r.RolePermissions)
            .FirstOrDefaultAsync(u => u.Email == model.Email);

        // Validate the password (using the EncryptionService)
        if (user == null ||
            user.Password != Convert.ToBase64String(_encryptionService.Encrypt(model.Password, user.Id)))
        {
            _logger.LogWarning("Login failed @ {timestamp}", DateTime.UtcNow);
            return Unauthorized("Invalid credentials.");
        }

        // Create a new Refresh Token
        var bytes = new byte[128];
        RandomNumberGenerator.Fill(bytes);
        user.RefreshToken = Convert.ToBase64String(bytes);

        // Set token creation and expiry
        user.RefreshTokenCreated = DateTime.UtcNow;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7); // Long-lived
        user.LastLogin = DateTime.UtcNow;

        // Save changes to the database
        await _dbContext.SaveChangesAsync();

        // 4. Generate the short-lived JWT
        var jwt = _authTokenService.GenerateAccessToken(
            user,
            user.Roles.Select(r => r.RoleName).ToArray()
        );
        var accessToken = new JwtSecurityTokenHandler().WriteToken(jwt);

        // Return both tokens to the client
        return Ok(new
        {
            AccessToken = accessToken,
            RefreshToken = user.RefreshToken,
            ExpiresInSeconds = (int)(jwt.ValidTo - DateTime.UtcNow).TotalSeconds
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] TokenExchangeModel model)
    {
        // Find the user by the provided Refresh Token
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == model.RefreshToken);

        // If user found, invalidate the Refresh Token by setting it to null and expiry to -infinity
        if (user is not null)
        {
            // Invalidate the Refresh Token
            user.RefreshToken = null;
            user.RefreshTokenExpiry = DateTime.MinValue;
            await _dbContext.SaveChangesAsync();

            // Return success response
            return Ok("Logged out successfully.");
        }

        // If no user found, return NotFound
        return NotFound("Active session not found for the provided token.");
    }
}