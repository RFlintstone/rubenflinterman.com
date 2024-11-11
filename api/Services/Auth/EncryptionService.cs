using System.Security.Cryptography;
using System.Text;

namespace Api.Services.Auth;

public class EncryptionService
{
    private readonly byte[] encryptionKey;
    private readonly byte[] iv;

    public EncryptionService(IConfiguration configuration)
    {
        var encryptionKeyString = configuration["Encryption:Key"];
        var ivString = configuration["Encryption:IV"];

        byte[] encryptionKey = string.IsNullOrEmpty(encryptionKeyString) ? Array.Empty<byte>() : Convert.FromBase64String(encryptionKeyString);
        byte[] iv = string.IsNullOrEmpty(ivString) ? Array.Empty<byte>() : Convert.FromBase64String(ivString);
    }

    public byte[] Encrypt(string plaintext)
    {
        return Encrypt(plaintext, encryptionKey, iv);
    }
    
    public static byte[] Encrypt(string plaintext, byte[] key, byte[] iv)
    {
        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.Key = key;
            aesAlg.IV = iv;
            ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);
            byte[] encryptedBytes;
            using (var msEncrypt = new System.IO.MemoryStream())
            {
                using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                {
                    byte[] plainBytes = Encoding.UTF8.GetBytes(plaintext);
                    csEncrypt.Write(plainBytes, 0, plainBytes.Length);
                }

                encryptedBytes = msEncrypt.ToArray();
            }

            return encryptedBytes;
        }
    }
}