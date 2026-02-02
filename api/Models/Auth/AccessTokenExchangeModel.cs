using System.ComponentModel.DataAnnotations;

namespace Api.Models.Auth;

public class AccessTokenExchangeModel
{
    [Required(ErrorMessage = "Email is required.")]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "AccessToken is required.")]
    [DataType(DataType.Password)]
    public string AccessToken { get; set; } = string.Empty;
}