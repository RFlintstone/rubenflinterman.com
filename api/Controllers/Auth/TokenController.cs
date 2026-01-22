using System.IdentityModel.Tokens.Jwt;
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

    // [HttpPost] // POST api/v1/token - Authenticate user and issue JWT token
    // public async Task<IActionResult> PostLogin([FromBody] TokenRequestModel model)
    // {
    //     // Fetch data asynchronously
    //     var user = await _dbContext.Users.FirstOrDefaultAsync(u =>
    //         u.Email == model.Email &&
    //         u.RefreshToken == model.Token
    //     );
    //     
    //     // If we couldn't find a user, the user is incorrect
    //     if (user is null)
    //     {
    //         _logger.LogWarning("Attempt to log in a user failed: User is null.");
    //         return Unauthorized("Invalid credentials");
    //     }
    //     
    //     // Check token expiry and creation date+time
    //     if (user.RefreshTokenExpiry <= DateTime.UtcNow || user.RefreshTokenCreated >= DateTime.UtcNow)
    //     {
    //         _logger.LogWarning("Attempt to log in a user failed: Token expired.");
    //         return Unauthorized("Invalid credentials");
    //     }
    //     
    //     // Log that the user has successfully authorized their request using a token.
    //     if (_logger.IsEnabled(LogLevel.Information))
    //     {
    //         _logger.LogInformation("User {Username} logged in", user.Username);
    //     }
    //
    //     // generate token for user using the composed AuthToken instance
    //     var token = _authTokenService.GenerateAccessToken(model.Email, user.Id, user.Roles);
    //
    //     // return access token for user's use
    //     return Ok(new { AccessToken = new JwtSecurityTokenHandler().WriteToken(token) });
    // }
    
    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] TokenExchangeModel model)
    {
        // Get the user by the provided Refresh Token
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == model.RefreshToken);

        // Check if the user exists and the Refresh Token is still valid
        if (user is null || user.RefreshTokenExpiry < DateTime.UtcNow)
        {
            return Unauthorized("Session expired.");
        }

        // Generate New Access Token (JWT)
        var jwt = _authTokenService.GenerateAccessToken(user.Email, user.Id, user.Roles);
        var jwtString = new JwtSecurityTokenHandler().WriteToken(jwt);

        // Issue a new Refresh Token so the old one can't be reused
        user.RefreshToken = Guid.NewGuid().ToString(); 
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
    
        // Save changes to the database
        await _dbContext.SaveChangesAsync();

        // Return the new tokens to the client
        return Ok(new { 
            AccessToken = jwtString, 
            RefreshToken = user.RefreshToken,
            ExpiresInSeconds = (int)(jwt.ValidTo - DateTime.UtcNow).TotalSeconds
        });
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthLoginModel model)
    {
        // 1. Find user by email (Async to keep the API responsive)
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

        // 2. Validate Password (Using your EncryptionService)
        if (user == null || user.Password != Convert.ToBase64String(_encryptionService.Encrypt(model.Password, user.Id)))
        {
            _logger.LogWarning("Login failed @ {timestamp}", DateTime.UtcNow);
            return Unauthorized("Invalid credentials.");
        }

        // 3. Create a new Refresh Token
        user.RefreshToken = Guid.NewGuid().ToString();
        user.RefreshTokenCreated = DateTime.UtcNow;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7); // Long-lived
        user.LastLogin = DateTime.UtcNow;

        // Save changes to the database
        await _dbContext.SaveChangesAsync();

        // 4. Generate the short-lived JWT
        var jwt = _authTokenService.GenerateAccessToken(user.Email, user.Id, user.Roles);
        var accessToken = new JwtSecurityTokenHandler().WriteToken(jwt);

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
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == model.RefreshToken);
        if (user is not null)
        {
            user.RefreshToken = null; // Invalidate the token
            user.RefreshTokenExpiry = DateTime.MinValue;
            await _dbContext.SaveChangesAsync();
        }
        return Ok();
    }
}
