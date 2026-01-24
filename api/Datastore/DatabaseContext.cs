using Api.Models.Storage;
using Api.Models.Users;
using Api.Services.Auth;
using Microsoft.EntityFrameworkCore;

public class DatabaseContext : DbContext
{
    private readonly EncryptionService _encryptionService;
    private readonly IConfiguration _configuration;

    public DbSet<UserInfoModel> Users { get; set; }
    public DbSet<FileStorageModel> FileStorage { get; set; }

    public DatabaseContext(DbContextOptions<DatabaseContext> options, EncryptionService encryptionService,
        IConfiguration configuration) : base(options)
    {
        _encryptionService = encryptionService;
        _configuration = configuration;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure primary keys
        modelBuilder.Entity<UserInfoModel>().HasKey(x => x.Id);
        modelBuilder.Entity<FileStorageModel>().HasKey(x => x.Id);
    }
}