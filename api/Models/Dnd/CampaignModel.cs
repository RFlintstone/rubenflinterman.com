using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Api.Models.Users;

namespace Api.Models.Dnd;

[Table("DnD_Campaigns")]
public class CampaignModel
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Theme { get; set; } = "amber";

    [MaxLength(2000)]
    public string Summary { get; set; } = string.Empty;

    // Navigation Properties (Principal side)
    public virtual ICollection<QuoteModel> Quotes { get; set; } = new List<QuoteModel>();
    public virtual ICollection<LoreEntryModel> LoreEntries { get; set; } = new List<LoreEntryModel>();
    public virtual ICollection<CharacterModel> Party { get; set; } = new List<CharacterModel>();
    public virtual ICollection<QuestModel> Quests { get; set; } = new List<QuestModel>();
    
    // Ownership
    [Required]
    public Guid DungeonMasterId { get; set; }

    [ForeignKey(nameof(DungeonMasterId))]
    public virtual UserInfoModel DungeonMaster { get; set; } = null!;

    public virtual ICollection<UserInfoModel> EnrolledUsers { get; set; } = new List<UserInfoModel>();
}