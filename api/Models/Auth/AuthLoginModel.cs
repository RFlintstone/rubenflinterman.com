using System.ComponentModel.DataAnnotations;

namespace Api.Models.Auth;

public class AuthLoginModel
{
    [Required(ErrorMessage = "Email is required.")]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Password is required.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;
}