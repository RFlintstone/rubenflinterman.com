using System.IO.Compression;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Api.Constants;
using Api.Services.Storage;
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

    /// <summary>
    /// Determines if a file should be compressed based on content type and file signatures.
    /// Validates against magic numbers to prevent content-type spoofing.
    /// </summary>
    private bool ShouldCompressFile(IFormFile file)
    {
        FileInspectionService inspectionService = new FileInspectionService();
        var result = inspectionService.ShouldCompressAsync(file).Result;
        return Task.FromResult(result).Result;
    }

    public StorageController(DatabaseContext dbContext, ILogger<StorageController> logger, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _logger = logger;
        _connectionString = configuration.GetConnectionString("Postgres") ??
                            throw new InvalidOperationException("Postgres connection string not found");
    }

    /// <summary>
    /// Uploads a file via multipart/form-data.
    /// Streams directly into a PostgreSQL Large Object while calculating SHA-256 hash.
    /// </summary>
    /// <returns></returns>
    [HttpPost("upload")]
    [RequestSizeLimit(1073741824)] // 1 GB limit
    [Consumes("multipart/form-data")]
    [Authorize(Policy = AuthConstants.Permissions.Names.StorageWriteEndpointAccess)]
    public async Task<IActionResult> UploadFile()
    {
        // Get requesting user
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
        Guid? requestingUserId = userIdClaim != null ? Guid.Parse(userIdClaim.Value) : null;

        // Get user info for ownership assignment
        var requestingUser = await _dbContext.Users
            .Include(u => u.Roles)
            .ThenInclude(r => r.RolePermissions)
            .FirstOrDefaultAsync(u => u.Id == requestingUserId);

        // Check if there is a valid user making the request
        if (requestingUser == null) return NotFound("User not found.");

        // Validate request content type
        if (!Request.HasFormContentType) return BadRequest("Request must be multipart/form-data");

        // Extract file from form data
        var form = await Request.ReadFormAsync();
        var file = form.Files["file"];

        // Check if user wants to make the file public or private
        var isPublicValue = form["isPublic"].FirstOrDefault();

        // Parse isPublic flag in case the user may upload a file
        if (!bool.TryParse(isPublicValue, out bool isPublic))
        {
            isPublic = false; // Default to private if parsing fails or value is missing
        }

        // Check if user has permission to set public files
        if (!this.User.HasPermission(AuthConstants.Permissions.Names.StorageWritePublic) && isPublic)
        {
            return StatusCode(403, "You do not have permission to upload public files.");
        }

        // Check if user has permission to set private files
        if (!this.User.HasPermission(AuthConstants.Permissions.Names.StorageWritePrivate) && !isPublic)
        {
            return StatusCode(403, "You do not have permission to upload private files.");
        }

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

        string hash; // Track SHA-256 hash
        long compressedSize = 0; // Track compressed size
        try
        {
            // Initialize Large Object Manager
            var loManager = new NpgsqlLargeObjectManager(conn);

            // Create Large Object
            uint oid = loManager.Create();

            // Create SHA-256 hash object
            using (var sha256 = SHA256.Create())
            {
                // Open Large Object stream for writing
                await using var loStream = await loManager.OpenReadWriteAsync(oid);

                // Stream the uploaded file using original byte stream
                await using var inputStream = file.OpenReadStream();
                var buffer = new byte[81920];
                int bytesRead;

                if (ShouldCompressFile(file))
                {
                    // Compress file data on-the-fly using GZipStream 
                    await using (var gzipStream = new GZipStream(loStream, CompressionLevel.Optimal, leaveOpen: true))
                    {
                        while ((bytesRead = await inputStream.ReadAsync(buffer.AsMemory(0, buffer.Length),
                                   HttpContext.RequestAborted)) > 0)
                        {
                            // Update hash with original bytes
                            sha256.TransformBlock(buffer, 0, bytesRead, null, 0);

                            // Write compressed output
                            await gzipStream.WriteAsync(buffer.AsMemory(0, bytesRead), HttpContext.RequestAborted);
                        }

                        // Finalize the hash
                        sha256.TransformFinalBlock(Array.Empty<byte>(), 0, 0);

                        // Ensure gzip stream is flushed
                        await gzipStream.FlushAsync();
                    } // GZipStream disposed here - compression finalized

                    // Get the compressed size from the LO stream
                    compressedSize = loStream.Position;

                    // Flush LO stream
                    await loStream.FlushAsync();
                }
                else
                {
                    // No compression: write original bytes directly to Large Object
                    while ((bytesRead = await inputStream.ReadAsync(buffer, 0, buffer.Length)) > 0)
                    {
                        // Update hash with original bytes
                        sha256.TransformBlock(buffer, 0, bytesRead, null, 0);

                        // Write raw bytes to LO
                        await loStream.WriteAsync(buffer, 0, bytesRead);
                    }

                    // Finalize the hash
                    sha256.TransformFinalBlock(Array.Empty<byte>(), 0, 0);

                    // Ensure LO stream is flushed
                    await loStream.FlushAsync();
                }

                // Get the computed SHA-256 hash as a hex string. 
                hash = BitConverter.ToString(sha256.Hash!).Replace("-", "").ToLowerInvariant();

                // Prepare the INSERT command to store metadata
                await using var cmd = new NpgsqlCommand(
                    @"INSERT INTO file_storage(
                         ""Id"", 
                         ""FileName"", 
                         ""ContentType"", 
                         ""FileSize"", 
                         ""CompressedFileSize"",
                         ""LargeObjectOid"", 
                         ""Sha256Hash"", 
                         ""CreatedAtUtc"", 
                         ""IsPublic"",
                         ""OwnerId"",
                         ""ExpiresAtUtc"",
                         ""IsDeleted"",
                         ""IsCompressed"",
                         ""DownloadCount"") VALUES (@id, @name, @type, @size, @compressedSize, @oid, @hash, @now, @isPublic, @ownerId, @expiresAt, @isDeleted, @isCompressed, @downloadCount)",
                    conn, tx);

                // Add parameters to prevent SQL injection
                cmd.Parameters.AddWithValue("id", fileId);
                cmd.Parameters.AddWithValue("name", Path.GetFileName(file.FileName));
                cmd.Parameters.AddWithValue("type", file.ContentType ?? "application/octet-stream");
                cmd.Parameters.AddWithValue("size", file.Length);
                cmd.Parameters.AddWithValue("compressedSize",
                    ShouldCompressFile(file) && compressedSize > 0 ? compressedSize : 0);
                cmd.Parameters.Add(new NpgsqlParameter("oid", NpgsqlDbType.Oid) { Value = oid });
                cmd.Parameters.AddWithValue("hash", hash);
                cmd.Parameters.AddWithValue("now", DateTime.UtcNow);
                cmd.Parameters.AddWithValue("isPublic", isPublic);
                cmd.Parameters.AddWithValue("ownerId", requestingUser.Id);
                cmd.Parameters.AddWithValue("expiresAt", DBNull.Value);
                cmd.Parameters.AddWithValue("isDeleted", false);
                cmd.Parameters.AddWithValue("isCompressed", ShouldCompressFile(file));
                cmd.Parameters.AddWithValue("downloadCount", 0);

                // Execute the INSERT command
                await cmd.ExecuteNonQueryAsync();
            }

            await tx.CommitAsync();

            // Return the file ID and hash to the client
            return Ok(new { id = fileId, hash });
        }
        catch (Exception ex)
        {
            try
            {
                // Check if transaction is still valid before rolling back.
                if (tx.Connection != null)
                {
                    // Attempt to rollback transaction.
                    await tx.RollbackAsync();
                }

                // Log the error for diagnostics if in Development environment
                if (_logger.IsEnabled(LogLevel.Information) && IsDevelopmentEnvironment())
                {
                    // Log detailed error in Development environment
                    _logger.LogError(ex, "Upload failed for {File}", file.FileName);

                    // Return detailed error message
                    return StatusCode(500, ex.Message);
                }
            }
            catch (Exception rollbackEx)
            {
                // Log the error for diagnostics if in Development environment
                if (_logger.IsEnabled(LogLevel.Information) && IsDevelopmentEnvironment())
                {
                    // Log detailed error in Development environment
                    _logger.LogError(rollbackEx, "Failed to rollback transaction");

                    // Return detailed rollback error message
                    return StatusCode(500, $"Upload failed: {rollbackEx.Message}");
                }
            }

            // Return a generic 500 Internal Server Error.
            return StatusCode(500, "Upload failed");
        }
    }

    /// <summary>
    /// Streams a file from the database to the client.
    /// Supports Range Requests (pause/resume) and prevents memory buffering.
    /// </summary>
    /// <returns></returns>
    [HttpGet("download/{id}")]
    [Authorize(Policy = AuthConstants.Permissions.Names.StorageReadEndpointAccess)]
    public async Task<IActionResult> DownloadFile(Guid id)
    {
        // Get requesting user
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
        Guid? requestingUserId = userIdClaim != null ? Guid.Parse(userIdClaim.Value) : null;

        // Fetch user info for permission checks
        var requestingUser = await _dbContext.Users
            .Include(u => u.Roles)
            .ThenInclude(r => r.RolePermissions)
            .FirstOrDefaultAsync(u => u.Id == requestingUserId);

        // Check if there is a valid user requesting the file
        if (requestingUser == null) return StatusCode(403, "User not found.");

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
                f.IsDeleted,
                f.IsCompressed,
                f.LargeObjectOid
            })
            .FirstOrDefaultAsync();

        // Check existence of file by checking if metadata was found
        if (fileMeta == null) return NotFound();

        // Check if file is marked as deleted
        if (fileMeta.IsDeleted) return NotFound();

        // Check if the user has permission to read ALL public files
        if (fileMeta.IsPublic && !this.User.HasPermission(AuthConstants.Permissions.Names.StorageReadAllPublic))
        {
            // Public file but user lacks global public read permission
            return StatusCode(403, "You do not have permission to access public files.");
        }

        // Check if the user has permission to read ALL private files
        if (!fileMeta.IsPublic && !this.User.HasPermission(AuthConstants.Permissions.Names.StorageReadAllPrivate))
        {
            // User lacks global private read permission, check ownership
            if (fileMeta.OwnerId != requestingUserId)
            {
                // Not the owner of the private file
                return StatusCode(403, "You do not have permission to access this private file.");
            }

            // User is the owner, check if they may read their own private files
            if (!this.User.HasPermission(AuthConstants.Permissions.Names.StorageReadOwned))
            {
                // Owner lacks permission to read their own private files
                return StatusCode(403, "You do not have permission to access this private file.");
            }
        }

        // Check if file has been marked as expired to prevent downloads
        if (fileMeta.IsExpired) return StatusCode(410, "File has expired.");

        // Prepare DB connection and transaction for Large Object streaming
        var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        // Large Object operations must occur within a transaction
        // IMPORTANT: keep transaction open for entire stream lifetime
        var tx = await conn.BeginTransactionAsync();

        Stream? loStream = null; // Track for cleanup

        try
        {
            // Open Large Object stream
            var loManager = new NpgsqlLargeObjectManager(conn);
            loStream = await loManager.OpenReadAsync(fileMeta.LargeObjectOid);

            // Check if file is compressed
            Stream streamToReturn = fileMeta.IsCompressed
                ? new GZipStream(loStream, CompressionMode.Decompress, leaveOpen: false)
                : loStream;

            // Update download stats when the response has completed
            // As wel as dispose of connection, transaction, and LO stream
            HttpContext.Response.OnCompleted(async () =>
            {
                // Update Download Stats
                await UpdateDownloadStats(id);

                // Dispose stream resources
                await streamToReturn.DisposeAsync();
                if (loStream != null) await loStream.DisposeAsync();

                // Dispose transaction and connection
                await tx.DisposeAsync();
                await conn.DisposeAsync();
            });

            // Return the file stream result with appropriate headers
            return new FileStreamResult(streamToReturn, fileMeta.ContentType)
            {
                FileDownloadName = fileMeta.FileName,
                EnableRangeProcessing = !fileMeta.IsCompressed
            };
        }
        catch (Exception ex)
        {
            // Clean up stream if it was opened
            if (loStream != null)
            {
                await loStream.DisposeAsync();
            }

            // Rollback and dispose transaction
            await tx.RollbackAsync();
            await tx.DisposeAsync();

            // Dispose of connection as we are finished with database related tasks
            await conn.DisposeAsync();

            // Log the error for diagnostics
            if (_logger.IsEnabled(LogLevel.Error) && IsDevelopmentEnvironment())
            {
                _logger.LogError(ex, "Download failed for file ID {FileId}",
                    Regex.Replace(id.ToString(), "[^\\w-]", ""));
                return StatusCode(500, $"Download failed: {ex.Message}");
            }

            // Return a generic 500 Internal Server Error.
            return StatusCode(500, "Download failed");
        }
    }

    // TODO: Add update endpoint to modify file metadata (e.g., make private/public, set expiration, etc.). Maybe replace file too?

    [HttpDelete("delete/{id}")]
    [Authorize(Policy = AuthConstants.Permissions.Names.StorageDeleteEndpointAccess)]
    public async Task<IActionResult> DeleteFile(Guid id)
    {
        // Get requesting user
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
        Guid? requestingUserId = userIdClaim != null ? Guid.Parse(userIdClaim.Value) : null;

        // Check if there is a valid user making the request
        if (requestingUserId == null) return StatusCode(403, "User not found.");

        // Fetch user info for permission checks
        var requestingUser = await _dbContext.Users
            .Include(u => u.Roles)
            .ThenInclude(r => r.RolePermissions)
            .FirstOrDefaultAsync(u => u.Id == requestingUserId);

        // Get user permissions
        var userPermissions = requestingUser?.Roles
            .SelectMany(r => r.RolePermissions)
            .Select(p => p.PermissionName)
            .ToList() ?? new List<string>();

        // Fetch the OID from the file_storage table
        var fileRecord = await _dbContext.FileStorage
            .Where(f => f.Id == id)
            .Select(f => new { f.LargeObjectOid, f.FileName })
            .FirstOrDefaultAsync();

        // Check if a file with the 'oid' exists
        if (fileRecord == null) return NotFound("File record not found.");

        // Check if user is the owner of the file 
        if (!this.User.HasPermission(AuthConstants.Permissions.Names.StorageDeleteAll))
        {
            var fileOwnerId = await _dbContext.FileStorage
                .Where(f => f.Id == id)
                .Select(f => f.OwnerId)
                .FirstOrDefaultAsync();

            if (fileOwnerId != requestingUserId)
            {
                return StatusCode(403, "You do not have permission to delete this file.");
            }

            // User is the owner, check if they may delete their own files
            if (!this.User.HasPermission(AuthConstants.Permissions.Names.StorageDeleteOwned))
            {
                return StatusCode(403, "You do not have permission to delete this file.");
            }
        }

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
            if (IsDevelopmentEnvironment())
                _logger.LogError(ex, "Failed to update download stats for file {FileId} @ {timestamp}", id,
                    DateTime.UtcNow);
            else _logger.LogError(ex, "Failed to update download stats for file @ {timestamp}", DateTime.UtcNow);
        }
    }
}