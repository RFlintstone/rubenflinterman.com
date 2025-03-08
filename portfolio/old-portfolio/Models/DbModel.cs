namespace portfolio.Models;

public class DbModel
{
    public List<ProjectModel> Projects { get; init; } = new();
    
    public DbModel() { }
    
    public DbModel(List<ProjectModel> projects)
    {
        Projects = projects;
    }
}