using Api.Datastore;
using Api.Models.Auth;
using Api.Models.Users;
using Api.Services.Auth;
using Api.Services.Users;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers.Auth;

[Route("api/v1/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly DatabaseContext _dbContext;
    private readonly ILogger<AuthController> _logger;
    private readonly EncryptionService _encryptionService;
    private readonly AvatarService _avatarService;

    public AuthController(DatabaseContext dbContext, ILogger<AuthController> logger, EncryptionService encryptionService, AvatarService avatarService)
    {
        _dbContext = dbContext;
        _logger = logger;
        _encryptionService = encryptionService;
        _avatarService = avatarService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegistrationModel model)
    {
        // 1. Check if user already exists
        if (await _dbContext.Users.AnyAsync(u => u.Email == model.Email))
        {
            return Conflict("A user with this email already exists.");
        }

        // 2. Create the new User Entity
        var newUserId = Guid.NewGuid();
        
        // Fetch the avatar (Still awaiting here for simplicity, but it's now decoupled)
        var avatarBase64 = await _avatarService.GetDefaultAvatarBase64Async(model.Username);
        
        var newUser = new UserInfoModel
        {
            Id = newUserId,
            Username = model.Username,
            Email = model.Email,
            PhoneNumber = model.PhoneNumber ?? string.Empty,
            Roles = new[] { "User" },
            // Encrypt the password using the new ID as a salt/context
            Password = Convert.ToBase64String(_encryptionService.Encrypt(model.Password, newUserId)),
            Avatar = avatarBase64,
            LastLogin = DateTime.UtcNow,
            RefreshToken = Guid.NewGuid().ToString(),
            RefreshTokenCreated = DateTime.UtcNow,
            RefreshTokenExpiry = DateTime.UtcNow.AddDays(7)
        };

        // 3. Save to Database
        _dbContext.Users.Add(newUser);
        await _dbContext.SaveChangesAsync();

        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("New user registered @ {timestamp}", DateTime.UtcNow);
        }

        // 4. Return success (Optionally return the initial tokens so they are logged in immediately)
        return CreatedAtAction(nameof(Register), new { id = newUser.Id }, new { 
            Message = "User registered successfully",
            UserId = newUser.Id
        });
    }
}