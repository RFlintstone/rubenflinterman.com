using MudBlazor.Services;
using portfolio.Components;
using portfolio.Services;

// Create builder instance
var builder = WebApplication.CreateBuilder(args);

// Add MudBlazor services
builder.Services.AddMudServices();

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Register the ProjectService
builder.Services.AddScoped<IProjectService>(sp => 
{
    var contentRoot = sp.GetRequiredService<IHostEnvironment>().ContentRootPath;
    var filePath = Path.GetFullPath(Path.Combine(contentRoot, "wwwroot", "MyWork.json"));

    // Ensure that the resolved path is within the ContentRoot to avoid path traversal
    if (!filePath.StartsWith(contentRoot)) throw new UnauthorizedAccessException("Invalid path detected.");
    return new ProjectService(filePath);
});

// Build app
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// Middleware
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAntiforgery();

// Map components which we like to render
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

// Start the app
app.Run();