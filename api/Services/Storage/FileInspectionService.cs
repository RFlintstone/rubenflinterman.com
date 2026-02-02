namespace Api.Services.Storage;

public class FileInspectionService : IFileInspectionService
{
    public async Task<bool> ShouldCompressAsync(IFormFile file)
    {
        var contentType = DetermineContentType(file);

        var compressibleContentTypes = new HashSet<string>
        {
            "text/plain",
            "text/html",
            "text/css",
            "application/javascript",
            "application/json",
            "application/xml",
            "text/xml",
            "application/xhtml+xml",
            "application/rss+xml",
            "application/atom+xml",
            "application/x-javascript",
            "application/x-httpd-php",
            "application/sql",
            "text/csv",
            "text/markdown"
        };

        return (compressibleContentTypes.Contains(contentType) && await IsTextBasedFile(file));
    }

    private string DetermineContentType(IFormFile file)
    {
        return file.ContentType?.ToLowerInvariant() ?? "application/octet-stream";
    }

    private async Task<bool> IsTextBasedFile(IFormFile file)
    {
        var binarySignatureBlacklist = new Dictionary<byte[], string>
        {
            { new byte[] { 0x89, 0x50, 0x4E, 0x47 }, "PNG" },
            { new byte[] { 0xFF, 0xD8, 0xFF }, "JPEG" },
            { new byte[] { 0x47, 0x49, 0x46, 0x38 }, "GIF" },
            { new byte[] { 0x25, 0x50, 0x44, 0x46 }, "PDF" },
            { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, "ZIP/DOCX/XLSX" },
            { new byte[] { 0x50, 0x4B, 0x05, 0x06 }, "ZIP (empty)" },
            { new byte[] { 0x50, 0x4B, 0x07, 0x08 }, "ZIP (spanned)" },
            { new byte[] { 0x1F, 0x8B }, "GZIP" },
            { new byte[] { 0x42, 0x5A, 0x68 }, "BZIP2" },
            { new byte[] { 0x52, 0x61, 0x72, 0x21 }, "RAR" },
            { new byte[] { 0x37, 0x7A, 0xBC, 0xAF }, "7Z" },
            { new byte[] { 0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70 }, "MP4" },
            { new byte[] { 0x49, 0x44, 0x33 }, "MP3" },
            { new byte[] { 0x66, 0x4C, 0x61, 0x43 }, "FLAC" },
            { new byte[] { 0x4D, 0x5A }, "EXE/DLL" }
        };

        try
        {
            // Read first 512 bytes for magic number checking
            const int sampleSize = 512;
            var buffer = new byte[sampleSize];
            
            using var stream = file.OpenReadStream();
            var bytesRead = await stream.ReadAsync(buffer, 0, Math.Min(sampleSize, (int)file.Length));

            // Check against known binary signatures
            foreach (var signature in binarySignatureBlacklist)
            {
                if (bytesRead >= signature.Key.Length &&
                    StartsWithSignature(buffer, signature.Key))
                {
                    // This is a binary file trying to masquerade as text
                    return false;
                }
            }

            // Additional heuristic: Check if content is mostly printable ASCII/UTF-8
            // Text files typically have >95% printable characters
            int printableCount = 0;
            int nullCount = 0;

            for (int i = 0; i < bytesRead; i++)
            {
                byte b = buffer[i];

                // Count null bytes (common in binary files, rare in text)
                if (b == 0) nullCount++;

                // Count printable ASCII and common control chars
                if ((b >= 0x20 && b <= 0x7E) || // Printable ASCII
                    b == 0x09 || // Tab
                    b == 0x0A || // Line Feed
                    b == 0x0D || // Carriage Return
                    b >= 0x80) // UTF-8 multi-byte
                {
                    printableCount++;
                }
            }

            // If more than 5% null bytes, likely binary
            if (nullCount > bytesRead * 0.05)
            {
                return false;
            }

            // If less than 85% printable characters, likely binary
            double printableRatio = (double)printableCount / bytesRead;
            return printableRatio >= 0.85;
        }
        catch
        {
            // If we can't read the file, assume it's not compressible
            return false;
        }
    }

    /// <summary>
    /// Checks if a byte array starts with a specific signature.
    /// </summary>
    private bool StartsWithSignature(byte[] data, byte[] signature)
    {
        if (data.Length < signature.Length)
            return false;

        for (int i = 0; i < signature.Length; i++)
        {
            if (data[i] != signature[i])
                return false;
        }

        return true;
    }
}