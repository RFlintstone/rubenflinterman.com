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
        return Ok($"You are logged in as {userInfoService.GetUsername()} with id: {userInfoService.GetId()}");
    }
}