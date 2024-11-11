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

        // Generate a random key and IV in case of seeding
        // var key = Convert.FromBase64String(_encryptionKey);
        // var iv = Convert.FromBase64String(_encryptionIv);
        // using (var rng = new RNGCryptoServiceProvider())
        // {
        //     rng.GetBytes(key);
        //     rng.GetBytes(iv);
        // }
    }
}