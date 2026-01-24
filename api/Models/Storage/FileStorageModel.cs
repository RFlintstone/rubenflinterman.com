using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Api.Models.Storage;

/// <summary>
/// Represents a binary file stored directly in the PostgreSQL database.
/// Optimized for Large Object storage (TOAST) and secure executable distribution.
/// </summary>
[Table("file_storage")]
// Indexing strategy: prevents full table scans for common queries
[Index(nameof(Sha256Hash))] // Fast lookup for file deduplication
[Index(nameof(OwnerId))] // Fast lookup for 'User Dashboard' queries
[Index(nameof(ExpiresAtUtc), nameof(IsDeleted))] // Optimized for the background cleanup worker
public class FileStorageModel
{
    /// <summary>
    /// Unique identifier using a GUID to prevent 'Insecure Direct Object Reference' (IDOR) attacks.
    /// Attackers cannot guess the next file ID like they could with increments (1, 2, 3...).
    /// </summary>
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Original name of the file. Used to reconstruct the file on the user's disk.
    /// </summary>
    [Required, MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// MIME type (e.g., application/x-msdownload). 
    /// Defaults to 'octet-stream' to force browsers to treat it as binary rather than executing it.
    /// </summary>
    [Required, MaxLength(100)]
    public string ContentType { get; set; } = "application/octet-stream";

    /// <summary>
    /// Total size in bytes. Uses 'long' to support files larger than 2.1GB.
    /// </summary>
    [Range(0, long.MaxValue)]
    public long FileSize { get; set; }

    /// <summary>
    /// PostgreSQL Large Object reference (OID).
    /// The actual binary data lives in pg_largeobject.
    /// </summary>
    [Required]
    [Column(TypeName = "oid")]
    public uint LargeObjectOid { get; set; }

    /// <summary>
    /// SHA-256 hash of the FileData. Used to verify file integrity and prevent 
    /// corrupted downloads—critical for executable files.
    /// </summary>
    [Required, StringLength(64), Column(TypeName = "char(64)")]
    public string Sha256Hash { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp of upload. Set by the database on row insertion.
    /// </summary>
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// If true, any user can download the file. If false, only the OwnerId can access it.
    /// </summary>
    public bool IsPublic { get; set; }

    /// <summary>
    /// Foreign Key to the User/Account that uploaded the file.
    /// </summary>
    public Guid? OwnerId { get; set; }

    /// <summary>
    /// Point in time when the file should be automatically purged from the DB.
    /// </summary>
    public DateTime? ExpiresAtUtc { get; set; }

    /// <summary>
    /// Flag for 'Soft Deletion'. Allows for a 'Trash' period before permanent database deletion.
    /// </summary>
    public bool IsDeleted { get; set; }

    /// <summary>
    /// Tracks popularity. ConcurrencyCheck prevents 'Lost Updates' if multiple 
    /// users download simultaneously.
    /// </summary>
    [ConcurrencyCheck]
    public int DownloadCount { get; set; }

    /// <summary>
    /// Useful for telemetry: helps identify 'stale' files that haven't been touched in months.
    /// </summary>
    public DateTime? LastAccessedAtUtc { get; set; }

    /// <summary>
    /// Read-only logic property. Not stored in the DB.
    /// </summary>
    [NotMapped]
    public bool IsExpired => ExpiresAtUtc.HasValue && ExpiresAtUtc.Value < DateTime.UtcNow;

    /// <summary>
    /// Helper for the HTTP Response Header. Forces browsers to download the file 
    /// with the correct name instead of trying to open/render it.
    /// </summary>
    [NotMapped]
    public string ContentDisposition => $"attachment; filename=\"{FileName}\"";
}