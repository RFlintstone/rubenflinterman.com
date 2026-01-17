using System.ComponentModel.DataAnnotations;

namespace Api.Models.Auth;

public class AuthLoginModel(string email, string password)
{
    [Required(ErrorMessage = "Email is required.")]
    public string Email { get; set; } = email;

    [Required(ErrorMessage = "Password is required.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = password;
}