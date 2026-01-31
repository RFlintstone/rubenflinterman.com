using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models.Dnd;

[Table("DnD_LoreEntries")]
public class LoreEntryModel
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)] // Sufficient for a chapter or location title
    public string Title { get; set; } = string.Empty;

    [Required] public string Content { get; set; } = string.Empty;

    [Required] public string Status { get; set; } = string.Empty; // e.g., 'active', 'archived'

    [Required] public Guid CampaignId { get; set; }

    [Required] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}