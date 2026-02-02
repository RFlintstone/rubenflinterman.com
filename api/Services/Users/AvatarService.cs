using System.Text;

namespace Api.Services.Users;

public class AvatarService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AvatarService> _logger;

    public AvatarService(IHttpClientFactory httpClientFactory, ILogger<AvatarService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<string> GetDefaultAvatarBase64Async(string username)
    {
        // Generate the URL for the avatar based on the username
        var client = _httpClientFactory.CreateClient();
        var base64Identifier = Convert.ToBase64String(Encoding.UTF8.GetBytes(username));
        var url = $"https://avi.avris.it/letter-128/{base64Identifier}.png";

        try
        {
            // Fetch the avatar image
            var bytes = await client.GetByteArrayAsync(url);
            
            // Convert the image bytes to a Base64 string and return
            return Convert.ToBase64String(bytes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch avatar for {Username}. Using placeholder.", username);
            return "default_placeholder_string"; // A local static base64 or a simple string
        }
    }
}