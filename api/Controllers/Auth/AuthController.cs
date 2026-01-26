using Api.Constants;
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

    public AuthController(DatabaseContext dbContext, ILogger<AuthController> logger,
        EncryptionService encryptionService, AvatarService avatarService)
    {
        _dbContext = dbContext;
        _logger = logger;
        _encryptionService = encryptionService;
        _avatarService = avatarService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegistrationModel model)
    {
        // Check if a user with the provided email already exists
        if (await _dbContext.Users.AnyAsync(u => u.Email == model.Email))
        {
            return Conflict("A user with this email already exists.");
        }

        // Generate new User ID
        var newUserId = Guid.NewGuid();

        // Fetch the avatar (Still awaiting here for simplicity, but it's now decoupled)
        var avatarBase64 = await _avatarService.GetDefaultAvatarBase64Async(model.Username);

        // Fetch the default role from the database
        var defaultRole = await _dbContext.UserRoles
            .FirstOrDefaultAsync(r => r.RoleName.ToLower() == AuthConstants.Roles.RegularUser.RoleName.ToLower());
        
        // Ensure the default role exists
        if (defaultRole == null) return BadRequest("Something went wrong during registration. Please try again later.");
        
        // Create the new user
        var newUser = new UserInfoModel
        {
            Id = newUserId,
            Username = model.Username,
            Email = model.Email,
            PhoneNumber = model.PhoneNumber ?? string.Empty,
            Roles = new List<UserRoleModel> { defaultRole },
            Password = Convert.ToBase64String(_encryptionService.Encrypt(model.Password,
                newUserId)), // Encrypt the password using the new ID as a salt/context
            Avatar = avatarBase64,
            LastLogin = DateTime.UtcNow,
            RefreshToken = Guid.NewGuid().ToString(),
            RefreshTokenCreated = DateTime.UtcNow,
            RefreshTokenExpiry = DateTime.UtcNow.AddDays(7)
        };

        // Save the new user to the database
        _dbContext.Users.Add(newUser);
        await _dbContext.SaveChangesAsync();

        // Log the registration event, if logging is enabled
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("New user registered @ {timestamp}", DateTime.UtcNow);
        }

        // Return success (Optionally return the initial tokens so they are logged in immediately)
        return CreatedAtAction(nameof(Register), new { id = newUser.Id }, new
        {
            Message = "User registered successfully",
            UserId = newUser.Id
        });
    }
}