using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Uncomment after adding DB Context
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlServer(
//         builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();

builder.Services.AddOpenApi();

// Register Services Here
// Example
//builder.Services.AddScoped<QrqcService>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", builder =>
    {
        if (allowedOrigins.Length == 0)
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
            return;
        }

        builder.WithOrigins(allowedOrigins)
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

app.MapOpenApi();

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("../openapi/v1.json", "Taskmaster API v1");
});

app.UseHttpsRedirection();
app.UseCors("AllowClient");

app.MapControllers();

app.Run();