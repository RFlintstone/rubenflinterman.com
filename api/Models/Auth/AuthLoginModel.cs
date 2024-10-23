using System.ComponentModel.DataAnnotations;

namespace Api.Models.Auth;

public class AuthLoginModel(string username, string password)
{
    [Required(ErrorMessage = "Username is required.")]
    public string Username { get; set; } = username;

    [Required(ErrorMessage = "Password is required.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = password;
}