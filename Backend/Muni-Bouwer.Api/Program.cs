using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Data.DAL;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddDbContext<BouwerDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("BouwerDatabase")
    ));

builder.Services.AddScoped<StudentDAL>();
builder.Services.AddScoped<StudentService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();