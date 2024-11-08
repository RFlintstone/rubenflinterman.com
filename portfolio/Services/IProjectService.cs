using portfolio.Models;

namespace portfolio.Services;
using System.Threading.Tasks;

public interface IProjectService
{
    Task<DbModel> GetProjectsAsync();
}