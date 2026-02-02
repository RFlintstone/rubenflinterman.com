using Microsoft.AspNetCore.Mvc.Filters;
using System.Text.RegularExpressions;

namespace Api.Filter;

/// <summary>
/// Intercepts controller action arguments and sanitizes string inputs 
/// to prevent Log Forging (CRLF injection) attacks.
/// </summary>
public class LogSanitizationFilter : IActionFilter
{
    // Regex to match Carriage Return (\r) and Line Feed (\n)
    private static readonly Regex CrlfRegex = new(@"[\r\n]", RegexOptions.Compiled);

    public void OnActionExecuting(ActionExecutingContext context)
    {
        // Iterate through the parameters passed to the Action method
        foreach (var argument in context.ActionArguments.Keys.ToList())
        {
            if (context.ActionArguments[argument] is string value)
            {
                // Replace any newlines with a safe space
                context.ActionArguments[argument] = CrlfRegex.Replace(value, " ");
            }
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        // This runs after the controller action finishes. 
        // No logic needed here for sanitization.
    }
}