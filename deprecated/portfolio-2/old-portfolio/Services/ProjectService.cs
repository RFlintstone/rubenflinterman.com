using portfolio.Models;

namespace portfolio.Services;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

public class ProjectService : IProjectService
{
    private readonly string _path;

    public ProjectService(string path)
    {
        _path = path;
    }

    public async Task<DbModel> GetProjectsAsync()
    {
        if (File.Exists(_path))
        {
            var jsonString = await File.ReadAllTextAsync(_path);
            var data = JsonSerializer.Deserialize<DbModel>(jsonString);
            return data ?? new DbModel();
        }
        else
        {
            throw new FileNotFoundException("File not found!", _path);
        }
    }
}