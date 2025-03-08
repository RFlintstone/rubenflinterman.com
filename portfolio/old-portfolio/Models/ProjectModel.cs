namespace portfolio.Models;

using System.Collections.Generic; // Make sure to include this for Dictionary

public class ProjectModel
{
    public string Title { get; set; } = string.Empty; // Initialize to an empty string
    public string Image { get; set; } = string.Empty; // Initialize to an empty string
    public string MyRole { get; set; } = string.Empty; // Initialize to an empty string
    public bool Pinned { get; set; } = false; // Initialize to an empty string
    public DateModel? Date { get; set; } // Make Date nullable
    public BodyModel? Body { get; set; } // Make Body nullable

    // Assuming StartDate and EndDate are properties of a DateModel, make them nullable
    public DateTime? StartDate { get; set; } // Nullable
    public DateTime? EndDate { get; set; } // Nullable

    // If you have a List property, make it nullable too
    public List<string>? List { get; set; } // Make List nullable

    // Constructor (if you have one, otherwise, the auto-generated one will do)
    public ProjectModel()
    {
        // Optionally initialize lists or other properties
        List = new List<string>(); // If you want it to start as an empty list
    }
}


public class DateModel
{
    public string StartDate { get; set; }
    public string EndDate { get; set; }

    public DateModel(string startDate, string endDate)
    {
        StartDate = startDate;
        EndDate = endDate;
    }
}

public class BodyModel
{
    public string Text { get; set; }
    public Dictionary<string, string> List { get; set; } // Assuming you want a list structure

    public BodyModel(string text, Dictionary<string, string> list)
    {
        Text = text;
        List = list;
    }
}