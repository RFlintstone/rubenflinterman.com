using System.Security.Cryptography;
using Api.Models.Users;
using Api.Services.Auth;
using Microsoft.EntityFrameworkCore;

namespace Api.Datastore;

public class DatabaseContext : DbContext
{
    private readonly EncryptionService? _encryptionService;
    private readonly string? _encryptionKey;
    private readonly string? _encryptionIv;
    
    public DatabaseContext(DbContextOptions<DatabaseContext> options, EncryptionService encryptionService, IConfiguration configuration) :
        base(options)
    {
        _encryptionService = encryptionService;
        _encryptionKey = configuration["Encryption:Key"];
        _encryptionIv = configuration["Encryption:IV"];
    }

    public DbSet<UserInfoModel> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserInfoModel>().HasKey(x => x.Id);

        // Generate a random key and IV
        var key = Convert.FromBase64String(_encryptionKey);
        var iv = Convert.FromBase64String(_encryptionIv);
        using (var rng = new RNGCryptoServiceProvider())
        {
            rng.GetBytes(key);
            rng.GetBytes(iv);
        }

        // Seed
        modelBuilder.Entity<UserInfoModel>().HasData(new UserInfoModel
        {
            Id = Guid.NewGuid(),
            Username = "Ruben",
            Email = "r.w.flinterman@hotmail.com",
            Password = Convert.ToBase64String(_encryptionService.Encrypt("admin")),
            PhoneNumber = "",
            LastLogin = DateTime.UtcNow,
            Token = "deqdCsDhKsfYxBLgHLsdHJWhsdpvEUULb6Ry99HEHproXQMdbqP3kXepYRwyGG2Ie64x38CAbsuzjdxUdGAkD3klDbQrMeB5a7J0",
            TokenCreated = DateTime.UtcNow,
            TokenExpiry = DateTime.UtcNow.AddDays(30)
        });

        modelBuilder.Entity<UserInfoModel>().HasData(new UserInfoModel
        {
            Id = Guid.NewGuid(),
            Username = "User",
            Email = "user@user.com",
            Password = Convert.ToBase64String(_encryptionService.Encrypt("user")),
            PhoneNumber = "",
            LastLogin = DateTime.UtcNow,
            Token = "user_token",
            TokenCreated = DateTime.UtcNow,
            TokenExpiry = DateTime.UtcNow.AddDays(30)
        });
    }
}