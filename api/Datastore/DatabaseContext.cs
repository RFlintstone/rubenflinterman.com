using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Api.Models.Users;
using Api.Services.Auth;
using Microsoft.EntityFrameworkCore;

namespace Api.Datastore;

public class DatabaseContext : DbContext
{
    private readonly EncryptionService? _encryptionService;
    public DbSet<UserInfoModel> Users { get; set; }

    public DatabaseContext(DbContextOptions<DatabaseContext> options, EncryptionService encryptionService,
        IConfiguration configuration) :
        base(options)
    {
        _encryptionService = encryptionService;
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserInfoModel>().HasKey(x => x.Id);

        var UserID = Guid.NewGuid();
        var Username = Users.FirstOrDefault(x => x.Id == UserID).Username;
        
        modelBuilder.Entity<UserInfoModel>().HasData(new UserInfoModel
        {
            Id = UserID,
            Username = "Admin",
            Email = "admin@admin.com",
            Password = Convert.ToBase64String(_encryptionService.Encrypt("admin", UserID)),
            PhoneNumber = "",
            LastLogin = DateTime.UtcNow,
            Token = "admin_token",
            TokenCreated = DateTime.UtcNow,
            TokenExpiry = DateTime.UtcNow.AddDays(30),
            Roles = ["User","Admin"],
            Avatar = downloadDefaultAvatar(Username).Result
        });
        
        UserID = Guid.NewGuid();
        modelBuilder.Entity<UserInfoModel>().HasData(new UserInfoModel
        {
            Id = UserID,
            Username = "User",
            Email = "user@user.com",
            Password = Convert.ToBase64String(_encryptionService.Encrypt("user", UserID)),
            PhoneNumber = "",
            LastLogin = DateTime.UtcNow,
            Token = "user_token",
            TokenCreated = DateTime.UtcNow,
            TokenExpiry = DateTime.UtcNow.AddDays(30),
            Roles = ["User"],
            Avatar = downloadDefaultAvatar(Username).Result
        });
    }

    protected async Task<string> downloadDefaultAvatar(string username)
    {
        // Image properties
        var imageType = "letter"; // 'letter' or 'shape'
        var imageSize = 128;      // min 16, max 360
        var base64Identifier = Convert.ToBase64String(Encoding.UTF8.GetBytes(username));

        // Build URL
        var url = $"https://avi.avris.it/{imageType}-{imageSize}/{base64Identifier}.png";
        
        using var httpClient = new HttpClient();
        try
        {
            // Download image bytes and store as Base64 string
            var bytes = await httpClient.GetByteArrayAsync(url);
            var image = Convert.ToBase64String(bytes);
            return image; // succeeded
        }
        catch
        {
            // Could not fetch avatar
            return "default";
        }
    }
}