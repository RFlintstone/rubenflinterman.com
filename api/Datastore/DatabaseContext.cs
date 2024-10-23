using Api.Models.Users;
using Api.Services.Auth;
using Microsoft.EntityFrameworkCore;

namespace Api.Datastore;

public class DatabaseContext : DbContext
{
    private readonly EncryptionService? _encryptionService;
    public DatabaseContext(DbContextOptions<DatabaseContext> options, EncryptionService encryptionService) : base(options)
    {
        _encryptionService = encryptionService;
    }

    public DbSet<UserInfoModel> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserInfoModel>().HasKey(x => x.Id);

        // Seed
        modelBuilder.Entity<UserInfoModel>().HasData(new UserInfoModel
        {
            Id = Guid.NewGuid(),
            Username = "Ruben",
            Email = "r.w.flinterman@hotmail.com",
            Password = _encryptionService.EncryptSha256("admin"),
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
            Password = _encryptionService.EncryptSha256("user"),
            PhoneNumber = "",
            LastLogin = DateTime.UtcNow,
            Token = "user_token",
            TokenCreated = DateTime.UtcNow,
            TokenExpiry = DateTime.UtcNow.AddDays(30)
        });
    }
}