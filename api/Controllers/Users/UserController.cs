using Api.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Users;

[Route("/api/v1/[controller]")]
public class UserController(UserInfoService userInfoService) : ControllerBase
{
    [HttpGet("")] 
    [Authorize]
    public async Task<IActionResult> Get() // Added async Task
    {
        // Populate the service state from the JWT Claims
        userInfoService.SetId(User);
        userInfoService.SetUsername(User);
        await userInfoService.SetEmail(User);
        userInfoService.SetRoles(User);
        
        // Use await instead of .GetAwaiter().GetResult()
        await userInfoService.SetAvatarAsync(User);

        // Return user information
        return Ok(new {
            Id = userInfoService.GetId(),
            Username = userInfoService.GetUsername(),
            Email = userInfoService.GetEmail(),
            Roles = userInfoService.GetRoles(),
            Avatar = userInfoService.GetAvatar(),
        });
    }

    [HttpGet("admin")]
    [Authorize]
    public IActionResult GetAdmin()
    {
        userInfoService.SetId(User);
        userInfoService.SetUsername(User);
        userInfoService.SetRoles(User);

        bool isAdmin = userInfoService.GetRoles().Contains("Admin");

        return Ok(new
        {
            Username = userInfoService.GetUsername(),
            Id = userInfoService.GetId(),
            isAdministrator = isAdmin,
        });
    }
}