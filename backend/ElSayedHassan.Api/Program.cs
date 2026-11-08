using ElSayedHassan.Api.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")
        ?? throw new InvalidOperationException("Missing connection string 'Default'.")));

// CORS: allowed origins come from config ("Cors:Origins"), so production can override via env vars.
const string CorsPolicy = "frontend";
var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p => p
    .WithOrigins(corsOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod()));

// RFC 7807 ProblemDetails for all errors (400/404/409/500 ...).
builder.Services.AddProblemDetails();

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("db");

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseExceptionHandler();   // unhandled exceptions -> ProblemDetails (no stack trace in production)
app.UseStatusCodePages();    // empty 4xx/5xx responses -> ProblemDetails

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();                 // /openapi/v1.json
    app.MapScalarApiReference();      // /scalar
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
