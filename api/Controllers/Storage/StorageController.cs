using System.Security.Cryptography;
using Api.Models.Storage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;

namespace Api.Controllers.Storage;

[ApiController]
[Route("api/v1/[controller]")]
public class StorageController : ControllerBase
{
    private readonly DatabaseContext _dbContext;
    private readonly ILogger<StorageController> _logger;
    private readonly string _connectionString;

    public StorageController(DatabaseContext dbContext, ILogger<StorageController> logger, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _logger = logger;
        _connectionString = configuration.GetConnectionString("Postgres") ??
                            throw new InvalidOperationException("Postgres connection string not found");
    }

    /// <summary>
    /// Streams a file from the database to the client.
    /// Supports Range Requests (pause/resume) and prevents memory buffering.
    /// </summary>
    [HttpGet("download/{id}")]
    public async Task<IActionResult> DownloadFile(Guid id)
    {
        // Fetch metadata ONLY. Avoid loading FileData (byte[]) into memory.
        var fileMeta = await _dbContext.FileStorage
            .Where(f => f.Id == id && !f.IsDeleted)
            .Select(f => new
            {
                f.FileName,
                f.ContentType,
                f.IsPublic,
                f.OwnerId,
                f.IsExpired
            })
            .FirstOrDefaultAsync();

        if (fileMeta == null) return NotFound("File not found.");
        if (fileMeta.IsExpired) return StatusCode(410, "File has expired.");

        // TODO: Add your Auth check here if !fileMeta.IsPublic

        // Open a dedicated connection for manual streaming
        var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        var cmd = new NpgsqlCommand("SELECT \"FileData\" FROM file_storage WHERE \"Id\" = @id", conn);
        cmd.Parameters.AddWithValue("id", id);

        // SequentialAccess allows us to read the blob in chunks
        var reader = await cmd.ExecuteReaderAsync(System.Data.CommandBehavior.SequentialAccess |
                                                  System.Data.CommandBehavior.CloseConnection);

        if (!await reader.ReadAsync())
        {
            await conn.CloseAsync();
            return NotFound();
        }

        // Get the raw database stream
        var dbStream = reader.GetStream(0);

        // Update download count (Fire and forget or async)
        _ = UpdateDownloadStats(id);

        // FileStreamResult handles the heavy lifting of piping the DB stream to the HTTP response
        return new FileStreamResult(dbStream, fileMeta.ContentType)
        {
            FileDownloadName = fileMeta.FileName,
            EnableRangeProcessing = true, // Crucial for large EXEs
            LastModified = DateTimeOffset.UtcNow
        };
    }

    [HttpPost("upload")]
    [RequestSizeLimit(1073741824)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadFile()
    {
        var file = Request.Form.Files.FirstOrDefault();

        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided or file is empty.");
        }

        var fileId = Guid.NewGuid();
        using var sha256 = SHA256.Create();
        using var fileStream = file.OpenReadStream();
        using var cryptoStream = new CryptoStream(fileStream, sha256, CryptoStreamMode.Read);

        try
        {
            using (var conn = new NpgsqlConnection(_connectionString))
            {
                await conn.OpenAsync();

                // We include all columns required by your FileStorageModel
                // Note the use of double quotes for case-sensitive Postgres columns
                using var cmd = new NpgsqlCommand(
                    @"INSERT INTO file_storage 
                (""Id"", ""FileName"", ""ContentType"", ""FileSize"", ""FileData"", ""Sha256Hash"", ""CreatedAtUtc"", ""IsPublic"", ""IsDeleted"", ""DownloadCount"") 
                VALUES (@id, @name, @type, @size, @data, @hash, @now, @isPublic, @isDeleted, @downloadCount)", conn);

                cmd.Parameters.Add(new NpgsqlParameter("id", fileId));
                cmd.Parameters.Add(new NpgsqlParameter("name", Path.GetFileName(file.FileName)));
                cmd.Parameters.Add(new NpgsqlParameter("type", file.ContentType ?? "application/octet-stream"));
                cmd.Parameters.Add(new NpgsqlParameter("size", file.Length));
                cmd.Parameters.Add(new NpgsqlParameter("now", DateTime.UtcNow));

                // Map to your model defaults
                cmd.Parameters.Add(new NpgsqlParameter("isPublic", NpgsqlDbType.Boolean) { Value = true });
                cmd.Parameters.Add(new NpgsqlParameter("isDeleted", NpgsqlDbType.Boolean) { Value = false });
                cmd.Parameters.Add(new NpgsqlParameter("downloadCount", NpgsqlDbType.Integer) { Value = 0 });
                
                // Stream the data directly to the bytea column
                var dataParam = new NpgsqlParameter("data", NpgsqlTypes.NpgsqlDbType.Bytea) { Value = cryptoStream };
                cmd.Parameters.Add(dataParam);

                // Temporary hash string to satisfy [Required] and char(64) constraints
                var hashParam = new NpgsqlParameter("hash", NpgsqlTypes.NpgsqlDbType.Char, 64)
                    { Value = new string('0', 64) };
                cmd.Parameters.Add(hashParam);

                // This executes the stream transfer and calculates the hash in one pass
                await cmd.ExecuteNonQueryAsync();

                // 4. Finalize the Hash
                string finalHash = BitConverter.ToString(sha256.Hash!).Replace("-", "").ToLowerInvariant();

                // 5. Update the record with the final calculated hash
                await _dbContext.Database.ExecuteSqlRawAsync(
                    "UPDATE file_storage SET \"Sha256Hash\" = @hash WHERE \"Id\" = @id",
                    new NpgsqlParameter("@hash", finalHash),
                    new NpgsqlParameter("@id", fileId)
                );

                return Ok(new { id = fileId, hash = finalHash });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Upload failed for {FileName}", file.FileName);
            // Returning the error message helps debug constraint issues
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }

    private async Task UpdateDownloadStats(Guid id)
    {
        try
        {
            // Use raw SQL with explicit Npgsql parameters
            await _dbContext.Database.ExecuteSqlRawAsync(
                "UPDATE file_storage SET \"DownloadCount\" = \"DownloadCount\" + 1, \"LastAccessedAtUtc\" = @lastAccessed WHERE \"Id\" = @id",
                new NpgsqlParameter("@lastAccessed", DateTime.UtcNow),
                new NpgsqlParameter("@id", id)
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update download stats for file {FileId}", id);
        }
    }
}