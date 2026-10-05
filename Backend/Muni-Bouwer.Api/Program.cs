using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Business;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddDbContext<BouwerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("BouwerDatabase")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<Muni_Bouwer.Business.EnrollmentService>();
builder.Services.AddScoped<Muni_Bouwer.Business.DocumentService>();
builder.Services.AddScoped<Muni_Bouwer.Business.MedicalRecordService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();