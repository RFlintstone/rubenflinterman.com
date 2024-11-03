using System.Security.Cryptography;
using System.Text;

namespace Api.Services.Auth;

public class EncryptionService
{
    private readonly byte[] encryptionKey;
    private readonly byte[] iv;

    public EncryptionService(IConfiguration configuration)
    {
        encryptionKey = Convert.FromBase64String(configuration["Encryption:Key"]);
        iv = Convert.FromBase64String(configuration["Encryption:IV"]);
    }

    public byte[] Encrypt(string plaintext)
    {
        return Encrypt(plaintext, encryptionKey, iv);
    }

    // public string Decrypt(byte[] ciphertext)
    // {
    //     return Decrypt(ciphertext, encryptionKey, iv);
    // }
    //
    
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

    // public static string Decrypt(byte[] ciphertext, byte[] key, byte[] iv)
    // {
    //     using (Aes aesAlg = Aes.Create())
    //     {
    //         aesAlg.Key = key;
    //         aesAlg.IV = iv;
    //         ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);
    //         byte[] decryptedBytes;
    //         using (var msDecrypt = new System.IO.MemoryStream(ciphertext))
    //         {
    //             using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
    //             {
    //                 using (var msPlain = new System.IO.MemoryStream())
    //                 {
    //                     csDecrypt.CopyTo(msPlain);
    //                     decryptedBytes = msPlain.ToArray();
    //                 }
    //             }
    //         }
    //
    //         return Encoding.UTF8.GetString(decryptedBytes);
    //     }
    // }
}