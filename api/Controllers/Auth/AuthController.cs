using System.IdentityModel.Tokens.Jwt;
using Api.Datastore;
using Api.Models.Auth;
using Api.Services.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Auth;

[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DatabaseContext _dbContext;
    private readonly ILogger<AuthController> _logger;
    private readonly AuthTokenService _authTokenService;
    private readonly EncryptionService _encryptionService;

    public AuthController(DatabaseContext dbContext, ILogger<AuthController> logger, ILoggerFactory loggerFactory,
        IConfiguration configuration, EncryptionService encryptionService)
    {
        _dbContext = dbContext;
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _authTokenService = new AuthTokenService(loggerFactory, configuration);
        _encryptionService = encryptionService;
    }

    [HttpPost("register")]
    public IActionResult PostLogin([FromBody] AuthLoginModel model)
    {
        // Fetch data synchronously
        var user = _dbContext.Users.ToList().FirstOrDefault(u =>
            u.Email == model.Username &&
            u.Token == model.Password &&
            // u.Password == _encryptionService.EncryptSha256(model.Password) &&
            u.TokenCreated < DateTime.UtcNow &&
            u.TokenExpiry > DateTime.UtcNow
        );
        
        // If we couldn't find a user, the user is incorrect
        if (user is null)
        {
            _logger.LogWarning("Attempt to log in a user failed: User is null.");
            return Unauthorized("Invalid credentials");
        }

        // Log that the user has successfully authorised their request using a token.
        _logger.LogInformation($"User {user.Email} logged in");

        // generate token for user using the composed AuthToken instance
        var token = _authTokenService.GenerateAccessToken(model.Username, user.Id);

        // return access token for user's use
        return Ok(new { AccessToken = new JwtSecurityTokenHandler().WriteToken(token) });
    }
}