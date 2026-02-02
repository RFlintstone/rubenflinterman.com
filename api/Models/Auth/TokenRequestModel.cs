using System.ComponentModel.DataAnnotations;

namespace Api.Models.Auth;

public class TokenRequestModel(string email, string token)
{
    [Required(ErrorMessage = "Email is required.")]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; } = email;

    [Required(ErrorMessage = "RefreshToken is required.")]
    [DataType(DataType.Password)]
    public string RefreshToken { get; set; } = token;
}