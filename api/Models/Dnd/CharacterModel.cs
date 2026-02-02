using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Api.Models.Dnd;

[Table("DnD_Characters")] // Explicitly name the table
public class CharacterModel
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)] // Prevents Postgres from using 'text' (unlimited), uses varchar(100)
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)] public string Class { get; set; } = string.Empty;

    [Range(1, 20)] // Good for D&D logic validation
    public int Level { get; set; } = 1;

    [Url] // Validates format, though allows nulls
    [MaxLength(500)]
    public string? DndBeyondUrl { get; set; }

    [Required]
    [ForeignKey(nameof(Campaign))]
    public Guid CampaignId { get; set; }
    
    [JsonIgnore]
    public virtual CampaignModel? Campaign { get; set; }

    [Required] public Guid OwnerId { get; set; }

    [Required] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}