using Api.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Users;

[Route("/api/v1/[controller]")]
public class UserController(UserInfoService userInfoService) : ControllerBase
{
    [HttpGet("")] 
    [Authorize]
    public IActionResult Get()
    {
        userInfoService.SetUsername(User);
        userInfoService.SetId(User);
        userInfoService.SetRoles(User);

        return Ok(new {
            Username = userInfoService.GetUsername(),
            Id = userInfoService.GetId(),
            Roles = userInfoService.GetRoles(),
        });
    }

    [HttpGet("admin")]
    [Authorize]
    public IActionResult GetAdmin()
    {
        userInfoService.SetUsername(User);
        userInfoService.SetId(User);
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