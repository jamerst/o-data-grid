global using System.ComponentModel.DataAnnotations.Schema;

using System.Text.Json.Serialization;

using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;

using Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseKestrel(options => options.ListenAnyIP(5000));

// Add services to the container.
builder.Services.AddDbContext<ApiContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")!,
        o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SingleQuery)
    )
);

builder.Services
    .AddControllers()
    .AddOData(options => options
        .AddRouteComponents(ODataModelBuilder.Build())
        .Filter()
        .Select()
        .Expand()
        .Count()
        .OrderBy()
        .SetMaxTop(250)
    )
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddScoped<ISeeder, Seeder>();
builder.Services.AddHostedService<SeederService>();

var app = builder.Build();

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseODataRouteDebug();
    app.UseCors(options => options.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
}
else
{
    app.UseCors(options => options
        .SetIsOriginAllowed(origin =>
            Uri.TryCreate(origin, UriKind.Absolute, out Uri? uri)
            && (uri?.Host == "localhost" || uri?.Host == "o-data-grid.jtattersall.net")
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
    );
}


app.Run();
