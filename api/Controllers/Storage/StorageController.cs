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
        var fileMeta = await _dbContext.FileStorage
            .Where(f => f.Id == id && !f.IsDeleted)
            .Select(f => new
            {
                f.FileName,
                f.ContentType,
                f.IsPublic,
                f.OwnerId,
                f.IsExpired,
                f.LargeObjectOid
            })
            .FirstOrDefaultAsync();

        if (fileMeta == null) return NotFound();
        if (fileMeta.IsExpired) return StatusCode(410, "File has expired.");

        var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        // IMPORTANT: keep transaction open for entire stream lifetime
        var tx = await conn.BeginTransactionAsync();

        var loManager = new NpgsqlLargeObjectManager(conn);
        var loStream = loManager.OpenRead(fileMeta.LargeObjectOid);

        _ = UpdateDownloadStats(id);

        return new FileStreamResult(loStream, fileMeta.ContentType)
        {
            FileDownloadName = fileMeta.FileName,
            EnableRangeProcessing = true
        };
    }

    [HttpPost("upload")]
    [RequestSizeLimit(1073741824)] // 1 GB limit
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadFile()
    {
        if (!Request.HasFormContentType) return BadRequest("Request must be multipart/form-data");

        var form = await Request.ReadFormAsync();
        var file = form.Files["file"];

        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var fileId = Guid.NewGuid();

        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            var loManager = new NpgsqlLargeObjectManager(conn);

            // 1. Create Large Object
            uint oid = loManager.Create();

            // 2. Stream file → Large Object while calculating SHA-256
            using var sha256 = SHA256.Create();
            await using var loStream = loManager.OpenReadWrite(oid);
            await using var cryptoStream = new CryptoStream(loStream, sha256, CryptoStreamMode.Write);
            await using var inputStream = file.OpenReadStream();

            await inputStream.CopyToAsync(cryptoStream);
            cryptoStream.FlushFinalBlock();

            string hash = BitConverter.ToString(sha256.Hash!)
                .Replace("-", "")
                .ToLowerInvariant();

            // 3. Insert metadata
            await using var cmd = new NpgsqlCommand(
                @"INSERT INTO file_storage
              (""Id"", ""FileName"", ""ContentType"", ""FileSize"",
               ""LargeObjectOid"", ""Sha256Hash"",
               ""CreatedAtUtc"", ""IsPublic"", ""IsDeleted"", ""DownloadCount"")
              VALUES
              (@id, @name, @type, @size,
               @oid, @hash,
               @now, true, false, 0)",
                conn, tx);

            cmd.Parameters.AddWithValue("id", fileId);
            cmd.Parameters.AddWithValue("name", Path.GetFileName(file.FileName));
            cmd.Parameters.AddWithValue("type", file.ContentType ?? "application/octet-stream");
            cmd.Parameters.AddWithValue("size", file.Length);
            cmd.Parameters.Add(new NpgsqlParameter("oid", NpgsqlDbType.Oid) { Value = oid });
            cmd.Parameters.AddWithValue("hash", hash);
            cmd.Parameters.AddWithValue("now", DateTime.UtcNow);

            await cmd.ExecuteNonQueryAsync();
            await tx.CommitAsync();

            return Ok(new { id = fileId, hash });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            _logger.LogError(ex, "Upload failed for {File}", file.FileName);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteFile(Guid id)
    {
        // TODO: Implement file deletion endpoint. Should remove both metadata and large object.
        return Ok("Not implemented yet.");
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