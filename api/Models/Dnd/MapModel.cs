using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Api.Models.Dnd;

[Table("DnD_Maps")]
public class MapModel
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required] 
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required] 
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }
    
    [MaxLength(100)]
    public string Category { get; set; } = "Uncategorized";
    
    [Required]
    public bool IsPublic { get; set; } = false;

    [Required]
    [ForeignKey(nameof(Campaign))]
    public Guid CampaignId { get; set; }

    [JsonIgnore]
    public virtual CampaignModel? Campaign { get; set; }

    [Required] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}