using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Projeto.Core;
using Projeto.Infra;

var builder = WebApplication.CreateBuilder(args);

// Swagger + esquema Bearer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Projeto Simples API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Insira apenas o token JWT (sem o prefixo 'Bearer')"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// Injeta infra com connection string
var connStr = builder.Configuration.GetConnectionString("Sql")!;
builder.Services.AddSingleton<IUserRepo>(_ => new UserRepo(connStr));
builder.Services.AddSingleton<IAuthService, AuthService>();

// JWT
var keyBytes = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
        };
    });
builder.Services.AddAuthorization();

// CORS liberado p/ dev
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

// ==========================
// ROTAS
// ==========================

// Login
app.MapPost("/auth/login", async (IAuthService auth, LoginDto dto) =>
{
    var token = await auth.LoginAsync(dto.Email, dto.Senha);
    return token is null ? Results.Unauthorized() : Results.Ok(new { token });
})
.WithName("Login")
.Produces(200)
.Produces(401);

// ----- Esqueci a senha (ANÔNIMAS) -----

// Solicita reset: sempre 202 (não revela se email existe). Em DEV, token aparece no console.
app.MapPost("/auth/forgot", async (IAuthService auth, ForgotDto dto) =>
{
    await auth.CreatePasswordResetAsync(dto.Email);
    return Results.Accepted();
})
.AllowAnonymous()
.WithName("ForgotPassword")
.Produces(202);

// Redefine senha via token (GUID) gerado acima.
app.MapPost("/auth/reset", async (IAuthService auth, ResetDto dto) =>
{
    var ok = await auth.ResetPasswordAsync(dto.Token, dto.NovaSenha);
    return ok ? Results.NoContent() : Results.BadRequest("Token inválido ou expirado.");
})
.AllowAnonymous()
.WithName("ResetPassword")
.Produces(204)
.Produces(400);

// Registrar (apenas Admin)
app.MapPost("/auth/register", async (IAuthService auth, UserCreateDto dto, ClaimsPrincipal user) =>
{
    if (!user.IsInRole("Admin")) return Results.Forbid();
    await auth.RegisterAsync(dto);
    return Results.Created($"/users/{dto.Email}", new { dto.Email, dto.Nome, dto.IsAdmin, dto.ManagerEmail });
})
.RequireAuthorization()
.WithName("RegisterUser");

// Listar usuários (Admin)
app.MapGet("/users", async (IUserRepo repo, ClaimsPrincipal user) =>
{
    if (!user.IsInRole("Admin")) return Results.Forbid();
    var all = await repo.GetAllAsync();
    return Results.Ok(all);
})
.RequireAuthorization()
.WithName("ListUsers");

// Obter 1 usuário (Admin)
app.MapGet("/users/{email}", async (string email, IUserRepo repo, ClaimsPrincipal user) =>
{
    if (!user.IsInRole("Admin")) return Results.Forbid();
    var u = await repo.GetByEmailAsync(email);
    return u is null ? Results.NotFound() : Results.Ok(u);
})
.RequireAuthorization()
.WithName("GetUser");

// Atualizar (Admin)
app.MapPut("/users/{email}", async (string email, UserUpdateDto dto, IUserRepo repo, ClaimsPrincipal user) =>
{
    if (!user.IsInRole("Admin")) return Results.Forbid();
    await repo.UpdateAsync(email, dto);
    return Results.NoContent();
})
.RequireAuthorization()
.WithName("UpdateUser");

// Remover (Admin)
app.MapDelete("/users/{email}", async (string email, IUserRepo repo, ClaimsPrincipal user) =>
{
    if (!user.IsInRole("Admin")) return Results.Forbid();
    await repo.DeleteAsync(email);
    return Results.NoContent();
})
.RequireAuthorization()
.WithName("DeleteUser");

// Perfil logado
app.MapGet("/me", async (IAuthService auth, ClaimsPrincipal user) =>
{
    var email = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if (email is null) return Results.Unauthorized();
    var me = await auth.MeAsync(email);
    return me is null ? Results.NotFound() : Results.Ok(me);
})
.RequireAuthorization()
.WithName("Me");

// Seed opcional (execute 1x e remova depois)
app.MapPost("/dev/seed-admin", async (IAuthService auth) =>
{
    var created = await auth.CreateAdminIfNotExists("admin@local", "Administrador", "Admin@123");
    return Results.Ok(new { created });
});

app.Run();
