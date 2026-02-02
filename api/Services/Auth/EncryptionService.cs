using Konscious.Security.Cryptography;
using System.Security.Cryptography;
using System.Text;

namespace Api.Services.Auth;

public class EncryptionService
{
    public EncryptionService(IConfiguration configuration)
    {
    }

    public byte[] Encrypt(string plaintext, Guid userUuid)
    {
        // Derive a deterministic salt from the user UUID
        byte[] salt = GenerateSaltFromUserUuid(userUuid);
        byte[] userUuidBytes = Encoding.UTF8.GetBytes(userUuid.ToString());

        // Configure Argon2 with the plaintext and derived salt
        var argon2 = new Argon2d(Encoding.UTF8.GetBytes(plaintext))
        {
            DegreeOfParallelism = 8,
            MemorySize = 8192,
            Iterations = 40,
            Salt = salt,
            AssociatedData = userUuidBytes
        };

        // Generate the 128-byte hash
        return argon2.GetBytes(128);
    }

    private byte[] GenerateSaltFromUserUuid(Guid userUuid)
    {
        // Hash the user UUID to create a deterministic salt
        using var sha256 = SHA256.Create();
        return sha256.ComputeHash(Encoding.UTF8.GetBytes(userUuid.ToString()));
    }
}