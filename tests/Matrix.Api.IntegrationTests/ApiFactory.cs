using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Matrix.Api.IntegrationTests;

public sealed class ApiFactory(SqlServerFixture sql) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.AddControllers().AddApplicationPart(typeof(TestProtectedController).Assembly);
        });

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Matrix_TEST"] = sql.ConnectionString,
                ["Tenancy:HeaderName"] = "X-Tenant-Key",
                ["Tenancy:RequireHeader"] = "true",
                ["Tenancy:Tenants:test:ConnectionStringName"] = "Matrix_TEST",
                ["Tenancy:Tenants:test:Enabled"] = "true",
                ["Jwt:Issuer"] = "Matrix.Api.Tests",
                ["Jwt:Audience"] = "Matrix.Client.Tests",
                ["Jwt:SigningKey"] = "Matrix_Test_Jwt_Signing_Key_At_Least_32_Characters!",
                ["Jwt:AccessTokenMinutes"] = "30",
                ["Authentication:PreAuthMinutes"] = "5",
                ["Authentication:MaxFailedAttempts"] = "3",
                ["Authentication:LockoutMinutes"] = "1"
            });
        });
    }
}
