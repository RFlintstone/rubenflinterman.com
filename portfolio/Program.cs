using MudBlazor.Services;
using portfolio.Components;
using portfolio.Services;

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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();