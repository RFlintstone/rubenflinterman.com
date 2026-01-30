namespace Api.Services.Storage;

public interface IFileInspectionService
{
    Task<bool> ShouldCompressAsync(IFormFile file);
}