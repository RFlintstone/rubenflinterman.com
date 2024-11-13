using System.Security.Cryptography;
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
            Roles = ["User","Admin"]
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
            Roles = ["User"]
        });
    }
}