using Api.Models.Storage;
using Api.Models.Users;
using Api.Services.Auth;
using Microsoft.EntityFrameworkCore;

public class DatabaseContext : DbContext
{
    private readonly EncryptionService _encryptionService;
    private readonly IConfiguration _configuration;

    public DbSet<UserInfoModel> Users { get; set; }
    public DbSet<UserRoleModel> UserRoles { get; set; }
    public DbSet<UserPermissionModel> UserPermissions { get; set; }
    public DbSet<FileStorageModel> FileStorage { get; set; }

    public DatabaseContext(DbContextOptions<DatabaseContext> options, EncryptionService encryptionService,
        IConfiguration configuration) : base(options)
    {
        _encryptionService = encryptionService;
        _configuration = configuration;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // --- Configure primary keys ---
        // Users
        modelBuilder.Entity<UserInfoModel>().HasKey(x => x.Id);
        modelBuilder.Entity<UserRoleModel>().HasKey(x => x.Id);
        modelBuilder.Entity<UserPermissionModel>().HasKey(x => x.Id);

        // File Storage
        modelBuilder.Entity<FileStorageModel>().HasKey(x => x.Id);
        
        // --- Configure unique constraints ---
        modelBuilder.Entity<UserRoleModel>()
            .HasIndex(r => r.RoleName).IsUnique();
    
        modelBuilder.Entity<UserPermissionModel>()
            .HasIndex(p => p.PermissionName).IsUnique();
        
        // --- Configure relationships ---
        // Many-to-Many: User <-> Role
        modelBuilder.Entity<UserInfoModel>()
            .HasMany(u => u.Roles)
            .WithMany()
            .UsingEntity(j => j.ToTable("UserRolesJoin"));

        // Many-to-Many: Role <-> Permission
        modelBuilder.Entity<UserRoleModel>()
            .HasMany(r => r.RolePermissions)
            .WithMany()
            .UsingEntity(j => j.ToTable("RolePermissionsJoin"));
    }
}