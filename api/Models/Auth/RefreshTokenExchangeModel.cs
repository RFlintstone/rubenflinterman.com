using System.ComponentModel.DataAnnotations;

namespace Api.Models.Auth;

public class RefreshTokenExchangeModel
{
    [Required(ErrorMessage = "Email is required.")]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "RefreshToken is required.")]
    [DataType(DataType.Password)]
    public string RefreshToken { get; set; } = string.Empty;
}