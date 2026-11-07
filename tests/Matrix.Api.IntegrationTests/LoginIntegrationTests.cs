using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using Xunit;

namespace Matrix.Api.IntegrationTests;

[Collection("sqlserver")]
public sealed class LoginIntegrationTests(SqlServerFixture sql) : IAsyncLifetime
{
    private ApiFactory _factory = null!;
    private HttpClient _client = null!;

    public async Task InitializeAsync()
    {
        await sql.ResetAsync();
        _factory = new ApiFactory(sql);
        _client = _factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Tenant-Key", "test");
    }

    public async Task DisposeAsync()
    {
        _client.Dispose();
        await _factory.DisposeAsync();
    }


    [Fact]
    public async Task Login_WithMissingPassword_ReturnsBadRequestInsteadOfThrowingValidationMetadataException()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "JOHN", password = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SelectContext_WithInvalidIds_ReturnsBadRequest()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/select-context", new
        {
            preAuthToken = "dummy-token",
            companyId = 0,
            locationId = 0
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithLegacyPassword_MigratesCredentialAndReturnsJwt()
    {
        await SeedSingleContextUserAsync("001", "JOHN", "John Smith", EncodeLegacyPassword("secret"));

        var response = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "john", password = "secret" });
        var body = await ReadAsync(response);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(body.GetProperty("succeeded").GetBoolean());
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("accessToken").GetString()));
        Assert.Equal("001", body.GetProperty("user").GetProperty("userNo").GetString());

        await using var connection = new SqlConnection(sql.ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT COUNT(*) FROM dbo.Api_UserCredential WHERE CompanyId = 1 AND UserNo = '001'";
        Assert.Equal(1, Convert.ToInt32(await command.ExecuteScalarAsync()));
    }

    [Fact]
    public async Task Login_ReturnsRefreshToken_AndRefreshRotatesIt()
    {
        await SeedSingleContextUserAsync("012", "REFRESH", "Refresh User", EncodeLegacyPassword("secret"));
        var login = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "REFRESH", password = "secret" });
        var loginBody = await ReadAsync(login);
        var oldRefresh = loginBody.GetProperty("refreshToken").GetString();
        Assert.False(string.IsNullOrWhiteSpace(oldRefresh));

        var refresh = await _client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = oldRefresh });
        var body = await ReadAsync(refresh);
        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);
        Assert.True(body.GetProperty("succeeded").GetBoolean());
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("accessToken").GetString()));
        Assert.NotEqual(oldRefresh, body.GetProperty("refreshToken").GetString());

        var reuse = await _client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = oldRefresh });
        Assert.Equal(HttpStatusCode.Unauthorized, reuse.StatusCode);
    }

    [Fact]
    public async Task Logout_RevokesRefreshToken()
    {
        await SeedSingleContextUserAsync("013", "LOGOUT", "Logout User", EncodeLegacyPassword("secret"));
        var login = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "LOGOUT", password = "secret" });
        var token = (await ReadAsync(login)).GetProperty("refreshToken").GetString();
        Assert.Equal(HttpStatusCode.OK, (await _client.PostAsJsonAsync("/api/auth/logout", new { refreshToken = token })).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = token })).StatusCode);
    }

    [Fact]
    public async Task Login_WithModernCredential_SucceedsWithoutLegacyPassword()
    {
        await SeedSingleContextUserAsync("002", "MARY", "Mary Jones", null);
        await SeedModernPasswordAsync(1, "002", "secret");

        var response = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "MARY", password = "secret" });
        var body = await ReadAsync(response);

        Assert.True(body.GetProperty("succeeded").GetBoolean());
        Assert.False(body.GetProperty("requiresContextSelection").GetBoolean());
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsGenericFailureAndRecordsAttempt()
    {
        await SeedSingleContextUserAsync("003", "ALICE", "Alice", EncodeLegacyPassword("secret"));

        var response = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "ALICE", password = "wrong" });
        var body = await ReadAsync(response);

        Assert.True(body.GetProperty("succeeded").GetBoolean() == false);
        Assert.Equal("Invalid user name or password.", body.GetProperty("error").GetString());

        await using var connection = new SqlConnection(sql.ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT FailedAttempts FROM dbo.Api_LoginSecurity WHERE NormalizedUserName = 'ALICE'";
        Assert.Equal(1, Convert.ToInt32(await command.ExecuteScalarAsync()));
    }

    [Fact]
    public async Task Login_AfterMaxFailures_IsLockedOut()
    {
        await SeedSingleContextUserAsync("004", "LOCKME", "Lock Me", EncodeLegacyPassword("secret"));

        for (var i = 0; i < 3; i++)
            await _client.PostAsJsonAsync("/api/auth/login", new { userName = "LOCKME", password = "wrong" });

        var response = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "LOCKME", password = "secret" });
        var body = await ReadAsync(response);

        Assert.False(body.GetProperty("succeeded").GetBoolean());
        Assert.Equal("Invalid user name or password.", body.GetProperty("error").GetString());
    }

    [Fact]
    public async Task Login_WithMultipleContexts_ReturnsPreAuthToken_AndSelectionIssuesJwt()
    {
        await SeedUserAsync("005", "MULTI", "Multi User", EncodeLegacyPassword("secret"));
        await SeedUserCompanyRowAsync(2, "005", "MULTI", "Multi User", EncodeLegacyPassword("secret"));
        await SeedCompanyAsync(1, "Company One");
        await SeedCompanyAsync(2, "Company Two");
        await SeedLocationAsync(1, 1, "Location One");
        await SeedLocationAsync(2, 1, "Location Two");
        await GrantCompanyAsync("005", 1);
        await GrantCompanyAsync("005", 2);
        await GrantLocationAsync("005", 1, 1);
        await GrantLocationAsync("005", 2, 1);
        await GrantYearAsync("005", 1, 1);
        await GrantYearAsync("005", 2, 1);

        var login = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "MULTI", password = "secret" });
        var loginBody = await ReadAsync(login);
        var preAuth = loginBody.GetProperty("preAuthToken").GetString();

        Assert.True(loginBody.GetProperty("requiresContextSelection").GetBoolean());
        Assert.False(string.IsNullOrWhiteSpace(preAuth));
        Assert.False(loginBody.TryGetProperty("accessToken", out var token) && token.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(token.GetString()));

        var select = await _client.PostAsJsonAsync("/api/auth/select-context", new
        {
            preAuthToken = preAuth,
            companyId = 2,
            locationId = 1
        });
        var selectedBody = await ReadAsync(select);

        Assert.True(selectedBody.GetProperty("succeeded").GetBoolean());
        var accessToken = selectedBody.GetProperty("accessToken").GetString();
        Assert.False(string.IsNullOrWhiteSpace(accessToken));

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        var me = await _client.GetAsync("/api/auth/me");
        var meBody = await ReadAsync(me);

        Assert.Equal("005", meBody.GetProperty("userNo").GetString());
        Assert.Equal(2, meBody.GetProperty("companyId").GetByte());
        Assert.Equal(1, meBody.GetProperty("locationId").GetByte());
    }

    [Fact]
    public async Task PreAuthToken_IsOneTimeUse()
    {
        await SeedUserAsync("006", "ONETIME", "One Time", EncodeLegacyPassword("secret"));
        await SeedUserCompanyRowAsync(2, "006", "ONETIME", "One Time", EncodeLegacyPassword("secret"));
        await SeedCompanyAsync(1, "Company One");
        await SeedCompanyAsync(2, "Company Two");
        await SeedLocationAsync(1, 1, "Location One");
        await SeedLocationAsync(2, 1, "Location Two");
        await GrantCompanyAsync("006", 1);
        await GrantCompanyAsync("006", 2);
        await GrantLocationAsync("006", 1, 1);
        await GrantLocationAsync("006", 2, 1);
        await GrantYearAsync("006", 1, 1);
        await GrantYearAsync("006", 2, 1);

        var login = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "ONETIME", password = "secret" });
        var preAuth = (await ReadAsync(login)).GetProperty("preAuthToken").GetString();

        var first = await _client.PostAsJsonAsync("/api/auth/select-context", new { preAuthToken = preAuth, companyId = 1, locationId = 1 });
        Assert.True((await ReadAsync(first)).GetProperty("succeeded").GetBoolean());

        var second = await _client.PostAsJsonAsync("/api/auth/select-context", new { preAuthToken = preAuth, companyId = 1, locationId = 1 });
        var secondBody = await ReadAsync(second);
        Assert.False(secondBody.GetProperty("succeeded").GetBoolean());
    }

    [Fact]
    public async Task ContextSelection_CannotChooseUnauthorizedLocation()
    {
        await SeedUserAsync("007", "SCOPED", "Scoped User", EncodeLegacyPassword("secret"));
        await SeedCompanyAsync(1, "Company One");
        await SeedCompanyAsync(2, "Company Two");
        await SeedLocationAsync(1, 1, "Allowed Location");
        await SeedLocationAsync(2, 1, "Other Location");
        await GrantCompanyAsync("007", 1);
        await GrantCompanyAsync("007", 2);
        await GrantLocationAsync("007", 1, 1);
        await GrantYearAsync("007", 1, 1);

        var login = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "SCOPED", password = "secret" });
        var preAuth = (await ReadAsync(login)).GetProperty("preAuthToken").GetString();

        var response = await _client.PostAsJsonAsync("/api/auth/select-context", new { preAuthToken = preAuth, companyId = 2, locationId = 1 });
        var body = await ReadAsync(response);

        Assert.False(body.GetProperty("succeeded").GetBoolean());
        Assert.Equal("The selected company or location is not allowed for this user.", body.GetProperty("error").GetString());
    }

    [Fact]
    public async Task ContextSelection_ReturnsRichBootstrapPayload()
    {
        await SeedSingleContextUserAsync("010", "BOOTSTRAP", "Bootstrap User", EncodeLegacyPassword("secret"));
        await ExecuteAsync("""
            UPDATE dbo.Sys_Company
            SET CompanyName = 'PLAZA JEWELLERY (WATIYA)', CompanyNameArb = N'شركة بلازا', BaseCurrencyId = 'KWD',
                BaseCurrencyName = 'Kuwaiti Dinar', BaseCurrencyDigit = 3, BasePureGoldPurity = 999.9,
                MetalSymbol = 'g', CurrencySymbol = 'KD', DefaultDateFormat = 'dd/MM/yyyy'
            WHERE CompanyId = 1;
            UPDATE dbo.Sys_Location SET LocName = 'MAIN', LocNameArb = N'الرئيسي', LocShortName = 'MAIN', LocPhone = '12345678',
                LocAdd1 = 'Address 1', LocAdd2 = 'Address 2' WHERE CompanyId = 1 AND LocId = 1;
            INSERT dbo.Sys_PermGroupsModule (CompanyId, PermGroupNo, allow_admin, allow_file, allow_Fin, allow_Invent, allow_Pur, allow_Sal, allow_Fixed, allow_tool)
            VALUES (1, 1, 1, 1, 1, 1, 1, 1, 0, 1);
            INSERT dbo.rfSalesMan (CompanyId, SManId, SManName, SManNameArb, LocId, SManStatus) VALUES (1, '01', 'Mohammad', N'محمد', 1, 0);
            INSERT dbo.rfPayType (CompanyId, LocId, PayId, PayName, PayNameArb, PayTypeFlag, PayOrderNo, PayStatus) VALUES (1, 1, '01', 'CASH', N'نقدي', 0, 1, 0);
            INSERT dbo.rfArea (CompanyId, AreaId, AreaName, AreaNameArb) VALUES (1, '001', 'SALMIYA', N'السالمية');
            INSERT dbo.rfCountry (CompanyId, CountryId, CountryName, CountryNameArb, SortOrder) VALUES (1, '01', 'KUWAIT', N'الكويت', 1);
            INSERT dbo.rfCurrency (CompanyId, CurId, CurName, CurNameArb, CurRate, CurDecimal) VALUES (1, 'KWD', 'Kuwaiti Dinar', N'دينار كويتي', 1, 3);
            """);

        var response = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "BOOTSTRAP", password = "secret" });
        var body = await ReadAsync(response);

        Assert.True(body.GetProperty("succeeded").GetBoolean());
        Assert.Equal("PLAZA JEWELLERY (WATIYA)", body.GetProperty("context").GetProperty("companyName").GetString());
        Assert.Equal("MAIN", body.GetProperty("context").GetProperty("locationName").GetString());
        Assert.Equal(2026, body.GetProperty("context").GetProperty("financialYear").GetProperty("yearNo").GetInt32());
        Assert.Equal("01/01/2026", body.GetProperty("context").GetProperty("financialYear").GetProperty("startDate").GetString());
        Assert.True(body.GetProperty("modules").GetProperty("sales").GetBoolean());
        Assert.False(body.GetProperty("modules").GetProperty("fixedAssets").GetBoolean());
        Assert.Equal("01", body.GetProperty("lookups").GetProperty("salesmen")[0].GetProperty("id").GetString());
        Assert.Equal("01", body.GetProperty("lookups").GetProperty("paymentTypes")[0].GetProperty("id").GetString());
        Assert.Equal("001", body.GetProperty("lookups").GetProperty("areas")[0].GetProperty("id").GetString());
        Assert.Equal("01", body.GetProperty("lookups").GetProperty("nationalities")[0].GetProperty("id").GetString());
        Assert.Equal("KWD", body.GetProperty("lookups").GetProperty("currencies")[0].GetProperty("id").GetString());
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("accessTokenExpiresAtUtc").GetString()));
    }

    [Fact]
    public async Task ContextSelection_DoesNotReturnLookupDataUntilContextIsChosen()
    {
        await SeedUserAsync("011", "MULTIBOOT", "Multi Bootstrap", EncodeLegacyPassword("secret"));
        await SeedUserCompanyRowAsync(2, "011", "MULTIBOOT", "Multi Bootstrap", EncodeLegacyPassword("secret"));
        await SeedCompanyAsync(1, "Company One");
        await SeedCompanyAsync(2, "Company Two");
        await SeedLocationAsync(1, 1, "Location One");
        await SeedLocationAsync(2, 1, "Location Two");
        await GrantCompanyAsync("011", 1); await GrantCompanyAsync("011", 2);
        await GrantLocationAsync("011", 1, 1); await GrantLocationAsync("011", 2, 1);
        await GrantYearAsync("011", 1, 1); await GrantYearAsync("011", 2, 1);

        var login = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "MULTIBOOT", password = "secret" });
        var body = await ReadAsync(login);
        Assert.True(body.GetProperty("requiresContextSelection").GetBoolean());
        Assert.False(body.TryGetProperty("lookups", out _));

        var token = body.GetProperty("preAuthToken").GetString();
        var select = await _client.PostAsJsonAsync("/api/auth/select-context", new { preAuthToken = token, companyId = 2, locationId = 1 });
        var selected = await ReadAsync(select);
        Assert.True(selected.GetProperty("succeeded").GetBoolean());
        Assert.Equal(2, selected.GetProperty("context").GetProperty("companyId").GetByte());
        Assert.True(selected.TryGetProperty("lookups", out _));
    }

    [Fact]
    public async Task Me_WithoutToken_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_WithMalformedToken_ReturnsUnauthorized()
    {
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "not-a-jwt");

        var response = await _client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ModuleAuthorization_UsesServerSideDatabasePermission()
    {
        await SeedSingleContextUserAsync("009", "SALESUSER", "Sales User", EncodeLegacyPassword("secret"));
        await ExecuteAsync("""
            INSERT dbo.Sys_PermGroupsModule (CompanyId, PermGroupNo, allow_Sal)
            VALUES (1, 1, 1);
            """);

        var login = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "SALESUSER", password = "secret" });
        var token = (await ReadAsync(login)).GetProperty("accessToken").GetString();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var allowed = await _client.GetAsync("/api/test/sales");
        Assert.Equal(HttpStatusCode.OK, allowed.StatusCode);

        await ExecuteAsync("UPDATE dbo.Sys_PermGroupsModule SET allow_Sal = 0 WHERE CompanyId = 1 AND PermGroupNo = 1;");
        _factory.Services.GetRequiredService<Microsoft.Extensions.Caching.Memory.IMemoryCache>().Remove("module:1:1");

        var denied = await _client.GetAsync("/api/test/sales");
        Assert.Equal(HttpStatusCode.Forbidden, denied.StatusCode);
    }

    [Fact]
    public async Task Login_DoesNotUseLocationDatabaseCredentials()
    {
        await SeedSingleContextUserAsync("008", "NOROUTE", "No Route", EncodeLegacyPassword("secret"));
        await SetLocationDatabaseFieldsAsync(1, 1, "this-host-does-not-exist", "wrong-db", "wrong-user", "wrong-password");

        var response = await _client.PostAsJsonAsync("/api/auth/login", new { userName = "NOROUTE", password = "secret" });
        var body = await ReadAsync(response);

        Assert.True(body.GetProperty("succeeded").GetBoolean());
    }

    private async Task SeedSingleContextUserAsync(string userNo, string loginName, string name, string? legacyPassword)
    {
        await SeedUserAsync(userNo, loginName, name, legacyPassword);
        await SeedCompanyAsync(1, "Matrix Gold");
        await SeedLocationAsync(1, 1, "Main Location");
        await GrantCompanyAsync(userNo, 1);
        await GrantLocationAsync(userNo, 1, 1);
        await GrantYearAsync(userNo, 1, 1);
    }

    private async Task SeedUserAsync(string userNo, string loginName, string name, string? legacyPassword)
    {
        await ExecuteAsync("""
            INSERT dbo.Sys_User (CompanyId, emp_no, emp_name, user_name, user_password, group_name, group_no,
                                 user_PosFlag, user_EmailId, user_Editflag, user_StockAccessFlag, user_NonBrandFlag,
                                 user_DiscPer, user_ViewPreviousEntry, user_status)
            VALUES (1, @UserNo, @Name, @LoginName, @Password, 'Users', 1, 0, NULL, 0, 0, 0, 0, 0, 0);
            """, new { UserNo = userNo, Name = name, LoginName = loginName, Password = legacyPassword });
    }

    private Task SeedUserCompanyRowAsync(byte companyId, string userNo, string loginName, string name, string? legacyPassword) => ExecuteAsync("""
        INSERT dbo.Sys_User (CompanyId, emp_no, emp_name, user_name, user_password, group_name, group_no,
                             user_PosFlag, user_EmailId, user_Editflag, user_StockAccessFlag, user_NonBrandFlag,
                             user_DiscPer, user_ViewPreviousEntry, user_status)
        VALUES (@CompanyId, @UserNo, @Name, @LoginName, @Password, 'Users', 1, 0, NULL, 0, 0, 0, 0, 0, 0);
        """, new { CompanyId = companyId, UserNo = userNo, Name = name, LoginName = loginName, Password = legacyPassword });

    private Task SeedModernPasswordAsync(byte companyId, string userNo, string password)
    {
        var hasher = new PasswordHasher<object>();
        var hash = hasher.HashPassword(new object(), password);
        return ExecuteAsync("""
            INSERT dbo.Api_UserCredential (CompanyId, UserNo, PasswordHash, CreatedUtc, UpdatedUtc)
            VALUES (@CompanyId, @UserNo, @Hash, SYSUTCDATETIME(), SYSUTCDATETIME());
            """, new { CompanyId = companyId, UserNo = userNo, Hash = hash });
    }

    private Task SeedCompanyAsync(byte id, string name) => ExecuteAsync(
        "INSERT dbo.Sys_Company (CompanyId, CompanyName, CompanyActive) VALUES (@Id, @Name, 'Y');", new { Id = id, Name = name });

    private Task SeedLocationAsync(byte companyId, byte locationId, string name) => ExecuteAsync(
        "INSERT dbo.Sys_Location (CompanyId, LocId, LocName, LocActive) VALUES (@CompanyId, @LocationId, @Name, 'Y');",
        new { CompanyId = companyId, LocationId = locationId, Name = name });

    private Task GrantCompanyAsync(string userNo, byte companyId) => ExecuteAsync(
        "INSERT dbo.Sys_UserCompany (UserNo, CompanyId, CompanyAllow) VALUES (@UserNo, @CompanyId, 1);", new { UserNo = userNo, CompanyId = companyId });

    private Task GrantLocationAsync(string userNo, byte companyId, byte locationId) => ExecuteAsync(
        "INSERT dbo.Sys_UserLocation (UserNo, CompanyID, LocId, LocAllow) VALUES (@UserNo, @CompanyId, @LocationId, 1);",
        new { UserNo = userNo, CompanyId = companyId, LocationId = locationId });

    private Task GrantYearAsync(string userNo, byte companyId, byte locationId) => ExecuteAsync("""
        INSERT dbo.Sys_UserCompanyYear (CompanyId, UserNo, Year_Ref, FinStart_Date, FinEnd_Date, FinOpen_Date, Year_Active, CurrentYear_Flag, OpenStatus, LocId)
        VALUES (@CompanyId, @UserNo, 2026, '01/01/2026', '31/12/2026', '01/01/2026', 'YES', 'YES', 'OPEN', @LocationId);
        """, new { UserNo = userNo, CompanyId = companyId, LocationId = locationId });

    private Task SetLocationDatabaseFieldsAsync(byte companyId, byte locationId, string source, string database, string user, string password) => ExecuteAsync("""
        UPDATE dbo.Sys_Location
        SET LocDbSource = @Source, LocDbName = @Database, LocDbUser = @User, LocDbPwd = @Password
        WHERE CompanyId = @CompanyId AND LocId = @LocationId;
        """, new { CompanyId = companyId, LocationId = locationId, Source = source, Database = database, User = user, Password = password });

    private async Task ExecuteAsync(string sqlText, object? parameters = null)
    {
        await using var connection = new SqlConnection(sql.ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = sqlText;
        if (parameters is not null)
        {
            foreach (var property in parameters.GetType().GetProperties())
            {
                var parameter = command.CreateParameter();
                parameter.ParameterName = "@" + property.Name;
                parameter.Value = property.GetValue(parameters) ?? DBNull.Value;
                command.Parameters.Add(parameter);
            }
        }
        await command.ExecuteNonQueryAsync();
    }

    private static string EncodeLegacyPassword(string password)
    {
        var encoded = new StringBuilder();
        foreach (var ch in password)
            encoded.Append("0000000000").Append(((int)ch).ToString("D3"));

        var length = password.Length.ToString("D2");
        return "00000000" + length + encoded;
    }

    private static async Task<JsonElement> ReadAsync(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        return document.RootElement.Clone();
    }
}
