using Api.Models.Users;
using Api.Services.Auth;
using Microsoft.EntityFrameworkCore;

public class DatabaseContext : DbContext
{
    private readonly EncryptionService _encryptionService;
    private readonly IConfiguration _configuration;

    public DbSet<UserInfoModel> Users { get; set; }

    // Constructor with dependencies
    public DatabaseContext(
        DbContextOptions<DatabaseContext> options,
        EncryptionService encryptionService,
        IConfiguration configuration) : base(options)
    {
        _encryptionService = encryptionService;
        _configuration = configuration;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserInfoModel>().HasKey(x => x.Id);

        var adminId = Guid.Parse("00000000-0000-0000-0000-000000000001");

        modelBuilder.Entity<UserInfoModel>().HasData(new UserInfoModel
        {
            Id = adminId,
            Username = "Admin",
            Email = "admin@admin.com",
            Password = "SEED_PASSWORD", // We will rotate this in the Initializer
            Avatar = "default",
            Roles = ["User", "Admin"]
        });
    }
}