using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models.Dnd;

[Table("DnD_Quests")]
public class QuestModel
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required] [MaxLength(200)] public string Title { get; set; } = string.Empty;

    [Required] public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)] // Enough for 'active', 'completed', 'failed'
    public string Status { get; set; } = "active";

    [Required] public Guid CampaignId { get; set; }

    [Required] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}