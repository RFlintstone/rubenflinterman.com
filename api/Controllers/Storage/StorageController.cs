using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;

namespace Api.Controllers.Storage;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class StorageController : ControllerBase
{
    private readonly DatabaseContext _dbContext;
    private readonly ILogger<StorageController> _logger;
    private readonly string _connectionString;

    /// <summary>
    /// Determines if the application is currently running in the Development environment.
    /// </summary>
    /// <returns><c>true</c> if the environment name is Development; otherwise, <c>false</c>.</returns>
    private bool IsDevelopmentEnvironment() =>
        Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

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
    /// <returns></returns>
    [HttpGet("download/{id}")]
    public async Task<IActionResult> DownloadFile(Guid id)
    {
        // Fetch file metadata
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

        // Check existence of file by checking if metadata was found
        if (fileMeta == null) return NotFound();

        // Check if file has been marked as expired to prevent downloads
        if (fileMeta.IsExpired) return StatusCode(410, "File has expired.");

        // Prepare DB connection and transaction for Large Object streaming
        var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        // Large Object operations must occur within a transaction
        // IMPORTANT: keep transaction open for entire stream lifetime
        var tx = await conn.BeginTransactionAsync();

        // Open Large Object stream
        var loManager = new NpgsqlLargeObjectManager(conn);
        var loStream = await loManager.OpenReadAsync(fileMeta.LargeObjectOid);

        // Update download stats asynchronously (don't await)
        _ = UpdateDownloadStats(id);

        // Return the file stream result with appropriate headers
        return new FileStreamResult(loStream, fileMeta.ContentType)
        {
            FileDownloadName = fileMeta.FileName,
            EnableRangeProcessing = true
        };
    }

    /// <summary>
    /// Uploads a file via multipart/form-data.
    /// Streams directly into a PostgreSQL Large Object while calculating SHA-256 hash.
    /// </summary>
    /// <returns></returns>
    [HttpPost("upload")]
    [RequestSizeLimit(1073741824)] // 1 GB limit
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadFile()
    {
        // Validate request content type
        if (!Request.HasFormContentType) return BadRequest("Request must be multipart/form-data");

        // Extract file from form data
        var form = await Request.ReadFormAsync();
        var file = form.Files["file"];

        // Validate file presence
        if (file == null || file.Length == 0) return BadRequest("No file provided.");

        // Generate new file ID
        var fileId = Guid.NewGuid();

        // Prepare DB connection and transaction
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        // Large Object operations must occur within a transaction
        // IMPORTANT: keep transaction open for entire stream lifetime
        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            // Initialize Large Object Manager
            var loManager = new NpgsqlLargeObjectManager(conn);

            // Create Large Object
            uint oid = loManager.Create();

            // Create SHA-256 hash object
            using var sha256 = SHA256.Create();

            // Open Large Object stream for writing
            await using var loStream = await loManager.OpenReadWriteAsync(oid);

            // Create CryptoStream to compute hash while writing to Large Object
            await using var cryptoStream = new CryptoStream(loStream, sha256, CryptoStreamMode.Write);

            // Stream the uploaded file into the CryptoStream
            await using var inputStream = file.OpenReadStream();

            // Copy input stream to crypto stream. This writes the data to the Large Object and computes the hash.
            await inputStream.CopyToAsync(cryptoStream);

            // Finalize the hash computation and flush any remaining data
            await cryptoStream.FlushFinalBlockAsync();

            // Get the computed SHA-256 hash as a hex string. 
            string hash = BitConverter.ToString(sha256.Hash!).Replace("-", "").ToLowerInvariant();

            // Prepare the INSERT command to store metadata
            await using var cmd = new NpgsqlCommand(
                @"INSERT INTO file_storage(
                         ""Id"", 
                         ""FileName"", 
                         ""ContentType"", 
                         ""FileSize"", 
                         ""LargeObjectOid"", 
                         ""Sha256Hash"", 
                         ""CreatedAtUtc"", 
                         ""IsPublic"",
                         ""OwnerId"",
                         ""ExpiresAtUtc"",
                         ""IsDeleted"", 
                         ""DownloadCount"") VALUES (@id, @name, @type, @size, @oid, @hash, @now, @isPublic, @ownerId, @expiresAt, @isDeleted, @downloadCount)",
                conn, tx);

            // Add parameters to prevent SQL injection
            cmd.Parameters.AddWithValue("id", fileId);
            cmd.Parameters.AddWithValue("name", Path.GetFileName(file.FileName));
            cmd.Parameters.AddWithValue("type", file.ContentType ?? "application/octet-stream");
            cmd.Parameters.AddWithValue("size", file.Length);
            cmd.Parameters.Add(new NpgsqlParameter("oid", NpgsqlDbType.Oid) { Value = oid });
            cmd.Parameters.AddWithValue("hash", hash);
            cmd.Parameters.AddWithValue("now", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("isPublic", true);
            cmd.Parameters.AddWithValue("ownerId", DBNull.Value);
            cmd.Parameters.AddWithValue("expiresAt", DBNull.Value);
            cmd.Parameters.AddWithValue("isDeleted", false);
            cmd.Parameters.AddWithValue("downloadCount", 0);

            // Execute the INSERT command
            await cmd.ExecuteNonQueryAsync();
            await tx.CommitAsync();

            // Return the file ID and hash to the client
            return Ok(new { id = fileId, hash });
        }
        catch (Exception ex)
        {
            // On error, rollback transaction to avoid partial data
            await tx.RollbackAsync();

            // Log the error for diagnostics if in Development environment
            if (_logger.IsEnabled(LogLevel.Information) && IsDevelopmentEnvironment())
            {
                // Log detailed error in Development environment
                _logger.LogError(ex, "Upload failed for {File}", file.FileName);
                
                // Return detailed error message
                return StatusCode(500, ex.Message);
            }

            // Return a generic 500 Internal Server Error.
            return StatusCode(500, "Upload failed");
        }
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteFile(Guid id)
    {
        // Fetch the OID from the file_storage table
        var fileRecord = await _dbContext.FileStorage
            .Where(f => f.Id == id)
            .Select(f => new { f.LargeObjectOid, f.FileName })
            .FirstOrDefaultAsync();

        // Check if a file with the 'oid' exists
        if (fileRecord == null) return NotFound("File record not found.");

        // Prepare DB connection and transaction for Large Object deletion
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        // Large Object operations must occur within a transaction
        // IMPORTANT: keep transaction open for entire operation
        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            // Create Large Object Manager
            var loManager = new NpgsqlLargeObjectManager(conn);

            // Delete the Large Object from pg_largeobject with the fetched OID
            await loManager.UnlinkAsync(fileRecord.LargeObjectOid);

            // Delete the metadata record from file_storage
            await using var cmd = new NpgsqlCommand("DELETE FROM file_storage WHERE \"Id\" = @id", conn, tx);
            cmd.Parameters.AddWithValue("id", id);

            // Execute the DELETE command
            await cmd.ExecuteNonQueryAsync();

            // Commit the transaction
            await tx.CommitAsync();

            // Log successful deletion
            if (_logger.IsEnabled(LogLevel.Information) && IsDevelopmentEnvironment())
            {
                _logger.LogInformation("Successfully deleted file {FileName} (OID: {Oid})", fileRecord.FileName,
                    fileRecord.LargeObjectOid);
            }

            // Return No Content (status code 204) to indicate successful deletion
            return NoContent();
        }
        catch (Exception ex)
        {
            // On error, rollback transaction to avoid partial deletion
            await tx.RollbackAsync();

            // Log the error for diagnostics
            if (_logger.IsEnabled(LogLevel.Information) && IsDevelopmentEnvironment())
            {
                string sanitizedId = Regex.Replace(id.ToString(), @"[^\w\-]", ""); 
                string sanitizedMessage = Regex.Replace(ex.Message, @"[\r\n]", " ");
                _logger.LogError(ex, "Failed to delete file {Id}", sanitizedId);
                return StatusCode(500, $"Deletion failed: {sanitizedMessage}");
            }

            // Return a 500 Internal Server Error.
            return StatusCode(500, "Deletion failed");
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
            // Log error without throwing to avoid impacting the download
            if (IsDevelopmentEnvironment()) _logger.LogError(ex, "Failed to update download stats for file {FileId} @ {timestamp}", id, DateTime.UtcNow);
            else _logger.LogError(ex, "Failed to update download stats for file @ {timestamp}", DateTime.UtcNow);
        }
    }
}