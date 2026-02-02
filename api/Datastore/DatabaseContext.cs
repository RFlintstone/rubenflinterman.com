using Api.Models.Dnd;
using Api.Models.Storage;
using Api.Models.Users;
using Api.Services.Auth;
using Microsoft.EntityFrameworkCore;

public class DatabaseContext : DbContext
{
    private readonly EncryptionService _encryptionService;
    private readonly IConfiguration _configuration;

    // --- DbSets ---
    // Users and Auth
    public DbSet<UserInfoModel> Users { get; set; }
    public DbSet<UserRoleModel> UserRoles { get; set; }
    public DbSet<UserPermissionModel> UserPermissions { get; set; }

    // File Storage
    public DbSet<FileStorageModel> FileStorage { get; set; }

    // DnD
    public DbSet<CampaignModel> Campaigns { get; set; }
    public DbSet<QuoteModel> Quotes { get; set; }
    public DbSet<CharacterModel> Characters { get; set; }
    public DbSet<QuestModel> Quests { get; set; }
    public DbSet<LoreEntryModel> LoreEntries { get; set; }

    public DatabaseContext(DbContextOptions<DatabaseContext> options, EncryptionService encryptionService,
        IConfiguration configuration) : base(options)
    {
        _encryptionService = encryptionService;
        _configuration = configuration;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // User and Auth Configurations
        UserModelConfigurations(modelBuilder);

        // File Storage Configurations
        FileStorageModelConfigurations(modelBuilder);

        // DnD Specific Configurations
        DnDModelConfigurations(modelBuilder);
    }

    /// <summary>
    /// User and Authentication Model Configurations
    /// </summary>
    /// <param name="modelBuilder"></param>
    private void UserModelConfigurations(ModelBuilder modelBuilder)
    {
        // --- Configure primary keys ---
        // Users
        modelBuilder.Entity<UserInfoModel>().HasKey(x => x.Id);
        modelBuilder.Entity<UserRoleModel>().HasKey(x => x.Id);
        modelBuilder.Entity<UserPermissionModel>().HasKey(x => x.Id);

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

    /// <summary>
    /// File Storage Model Configurations
    /// </summary>
    /// <param name="modelBuilder"></param>
    private void FileStorageModelConfigurations(ModelBuilder modelBuilder)
    {
        // --- Configure primary keys ---
        modelBuilder.Entity<FileStorageModel>().HasKey(x => x.Id);
    }

    /// <summary>
    /// DnD Specific Model Configurations
    /// </summary>
    /// <param name="modelBuilder"></param>
    private void DnDModelConfigurations(ModelBuilder modelBuilder)
    {
        // One-to-Many: User (DM) -> Campaigns
        modelBuilder.Entity<CampaignModel>()
            .HasOne(c => c.DungeonMaster)
            .WithMany(u => u.CampaignsAsDM)  
            .HasForeignKey(c => c.DungeonMasterId)
            .OnDelete(DeleteBehavior.Restrict);
    
        // Many-to-Many: Campaign <-> User (Enrollment)
        modelBuilder.Entity<CampaignModel>()
            .HasMany(c => c.EnrolledUsers)
            .WithMany(u => u.EnrolledCampaigns)
            .UsingEntity(j => j.ToTable("CampaignEnrollments"));
    }
}