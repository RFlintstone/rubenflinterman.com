using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models.Dnd;

[Table("DnD_Quotes")]
public class QuoteModel
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required] public string Text { get; set; } = string.Empty;

    [MaxLength(150)] // Plenty for an author name or "Unknown"
    public string Author { get; set; } = string.Empty;

    [Required] public Guid CampaignId { get; set; }

    [Required] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}