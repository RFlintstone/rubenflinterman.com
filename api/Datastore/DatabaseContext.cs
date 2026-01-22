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
        IConfiguration configuration) : base(options)
    {
        _encryptionService = encryptionService;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserInfoModel>().HasKey(x => x.Id);

        var adminId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var adminUsername = "Admin";

        var userId = Guid.Parse("00000000-0000-0000-0000-000000000002");
        var userUsername = "User";

        modelBuilder.Entity<UserInfoModel>().HasData(new UserInfoModel
        {
            Id = adminId,
            Username = "Admin",
            Email = "admin@admin.com",
            Password = Convert.ToBase64String(_encryptionService.Encrypt("admin", adminId)),
            PhoneNumber = "",
            LastLogin = new DateTime(2026, 1, 1).ToUniversalTime(),
            RefreshToken = "admin_token",
            RefreshTokenCreated = new DateTime(2026, 1, 1).ToUniversalTime(),
            RefreshTokenExpiry = new DateTime(2026, 1, 2).ToUniversalTime(),
            Roles = ["User", "Admin"],
            Avatar = DownloadDefaultAvatar(adminUsername).Result
        });

        modelBuilder.Entity<UserInfoModel>().HasData(new UserInfoModel
        {
            Id = userId,
            Username = "User",
            Email = "user@user.com",
            Password = Convert.ToBase64String(_encryptionService.Encrypt("user", userId)),
            PhoneNumber = "",
            LastLogin = new DateTime(2026, 1, 1).ToUniversalTime(),
            RefreshToken = "user_token",
            RefreshTokenCreated = new DateTime(2026, 1, 1).ToUniversalTime(),
            RefreshTokenExpiry = new DateTime(2026, 1, 2).ToUniversalTime(),
            Roles = ["User"],
            Avatar = DownloadDefaultAvatar(userUsername).Result
        });
    }

    protected async Task<string> DownloadDefaultAvatar(string username)
    {
        // Image properties
        var imageType = "letter"; // 'letter' or 'shape'
        var imageSize = 128; // min 16, max 360
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