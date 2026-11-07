using System.Data.Common;
using Microsoft.Data.SqlClient;
using Testcontainers.MsSql;

namespace Matrix.Api.IntegrationTests;

public sealed class SqlServerFixture : IAsyncLifetime
{
    private readonly MsSqlContainer _container = new MsSqlBuilder()
        .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
        .WithPassword("Matrix_Test_Password_2026!")
        .Build();

    public string ConnectionString => _container.GetConnectionString();

    public async Task InitializeAsync()
    {
        await _container.StartAsync();
        await using var connection = new SqlConnection(ConnectionString);
        await connection.OpenAsync();

        const string sql = """
        IF OBJECT_ID('dbo.Sys_User', 'U') IS NOT NULL DROP TABLE dbo.Sys_User;
        IF OBJECT_ID('dbo.Sys_UserCompany', 'U') IS NOT NULL DROP TABLE dbo.Sys_UserCompany;
        IF OBJECT_ID('dbo.Sys_UserLocation', 'U') IS NOT NULL DROP TABLE dbo.Sys_UserLocation;
        IF OBJECT_ID('dbo.Sys_Company', 'U') IS NOT NULL DROP TABLE dbo.Sys_Company;
        IF OBJECT_ID('dbo.Sys_Location', 'U') IS NOT NULL DROP TABLE dbo.Sys_Location;
        IF OBJECT_ID('dbo.Sys_PermGroupsModule', 'U') IS NOT NULL DROP TABLE dbo.Sys_PermGroupsModule;
        IF OBJECT_ID('dbo.Api_RefreshToken', 'U') IS NOT NULL DROP TABLE dbo.Api_RefreshToken;
        IF OBJECT_ID('dbo.Api_PreAuthTicket', 'U') IS NOT NULL DROP TABLE dbo.Api_PreAuthTicket;
        IF OBJECT_ID('dbo.Api_LoginSecurity', 'U') IS NOT NULL DROP TABLE dbo.Api_LoginSecurity;
        IF OBJECT_ID('dbo.Api_UserCredential', 'U') IS NOT NULL DROP TABLE dbo.Api_UserCredential;
        IF OBJECT_ID('dbo.Sys_UserCompanyYear', 'U') IS NOT NULL DROP TABLE dbo.Sys_UserCompanyYear;
        IF OBJECT_ID('dbo.rfSalesMan', 'U') IS NOT NULL DROP TABLE dbo.rfSalesMan;
        IF OBJECT_ID('dbo.rfPayType', 'U') IS NOT NULL DROP TABLE dbo.rfPayType;
        IF OBJECT_ID('dbo.rfArea', 'U') IS NOT NULL DROP TABLE dbo.rfArea;
        IF OBJECT_ID('dbo.rfCountry', 'U') IS NOT NULL DROP TABLE dbo.rfCountry;
        IF OBJECT_ID('dbo.rfCurrency', 'U') IS NOT NULL DROP TABLE dbo.rfCurrency;

        CREATE TABLE dbo.Sys_User
        (
            CompanyId tinyint NOT NULL,
            emp_no nvarchar(3) NOT NULL,
            emp_name nvarchar(50) NOT NULL,
            user_name nvarchar(50) NULL,
            user_password nvarchar(255) NULL,
            group_name nvarchar(50) NULL,
            group_no smallint NULL,
            user_PosFlag tinyint NULL,
            user_EmailId nvarchar(100) NULL,
            user_Editflag tinyint NULL,
            user_StockAccessFlag tinyint NULL,
            user_NonBrandFlag tinyint NULL,
            user_DiscPer float NULL,
            user_ViewPreviousEntry tinyint NULL,
            user_status tinyint NULL,
            CONSTRAINT PK_Sys_User PRIMARY KEY (CompanyId, emp_no)
        );

        CREATE TABLE dbo.Sys_UserCompany
        (
            UserNo nvarchar(3) NOT NULL,
            CompanyId tinyint NOT NULL,
            CompanyAllow tinyint NOT NULL
        );

        CREATE TABLE dbo.Sys_UserLocation
        (
            UserNo nvarchar(3) NULL,
            CompanyID tinyint NULL,
            LocId tinyint NULL,
            LocAllow tinyint NULL
        );

        CREATE TABLE dbo.Sys_Company
        (
            CompanyId tinyint NOT NULL PRIMARY KEY,
            CompanyName nvarchar(100) NULL,
            CompanyNameArb nvarchar(100) NULL,
            BaseCurrencyId nvarchar(3) NULL,
            BaseCurrencyName nvarchar(50) NULL,
            BaseCurrencyDigit int NULL,
            BasePureGoldPurity float NULL,
            MetalSymbol nvarchar(100) NULL,
            CurrencySymbol nvarchar(100) NULL,
            DefaultDateFormat nvarchar(100) NULL,
            CompanyActive nvarchar(1) NULL
        );

        CREATE TABLE dbo.Sys_Location
        (
            CompanyId tinyint NOT NULL,
            LocId tinyint NOT NULL,
            LocName nvarchar(150) NULL,
            LocNameArb nvarchar(150) NULL,
            LocShortName nvarchar(10) NULL,
            LocPhone nvarchar(100) NULL,
            LocAdd1 nvarchar(250) NULL,
            LocAdd2 nvarchar(250) NULL,
            LocActive nvarchar(1) NULL,
            LocDbSource nvarchar(100) NULL,
            LocDbName nvarchar(100) NULL,
            LocDbUser nvarchar(10) NULL,
            LocDbPwd nvarchar(100) NULL,
            CONSTRAINT PK_Sys_Location PRIMARY KEY (CompanyId, LocId)
        );

        CREATE TABLE dbo.Sys_PermGroupsModule
        (
            CompanyId tinyint NOT NULL,
            PermGroupNo int NOT NULL,
            allow_admin tinyint NULL,
            allow_file tinyint NULL,
            allow_Fin tinyint NULL,
            allow_Invent tinyint NULL,
            allow_Pur tinyint NULL,
            allow_Sal tinyint NULL,
            allow_Fixed tinyint NULL,
            allow_tool tinyint NULL
        );

        CREATE TABLE dbo.Sys_UserCompanyYear
        (
            CompanyId tinyint NOT NULL,
            UserNo nvarchar(3) NOT NULL,
            Year_Ref int NOT NULL,
            FinStart_Date nvarchar(10) NULL,
            FinEnd_Date nvarchar(10) NULL,
            FinOpen_Date nvarchar(10) NULL,
            Year_Active nvarchar(3) NULL,
            CurrentYear_Flag nvarchar(3) NULL,
            OpenStatus nvarchar(8) NULL,
            LocId tinyint NULL,
            CONSTRAINT PK_Sys_UserCompanyYear PRIMARY KEY (CompanyId, UserNo, Year_Ref)
        );

        CREATE TABLE dbo.rfSalesMan
        (
            CompanyId tinyint NOT NULL, SManId nvarchar(3) NOT NULL, SManName nvarchar(50) NULL,
            SManNameArb nvarchar(50) NULL, LocId tinyint NULL, SManStatus tinyint NULL,
            CONSTRAINT PK_rfSalesMan PRIMARY KEY (CompanyId, SManId)
        );

        CREATE TABLE dbo.rfPayType
        (
            CompanyId tinyint NOT NULL, LocId tinyint NOT NULL, PayId nvarchar(2) NOT NULL,
            PayName nvarchar(30) NOT NULL, PayNameArb nvarchar(30) NULL, PayTypeFlag tinyint NULL,
            PayOrderNo int NULL, PayStatus int NULL,
            CONSTRAINT PK_rfPayType PRIMARY KEY (CompanyId, LocId, PayId)
        );

        CREATE TABLE dbo.rfArea
        (
            CompanyId tinyint NOT NULL, AreaId nvarchar(3) NOT NULL, AreaName nvarchar(50) NULL,
            AreaNameArb nvarchar(50) NULL,
            CONSTRAINT PK_rfArea PRIMARY KEY (CompanyId, AreaId)
        );

        CREATE TABLE dbo.rfCountry
        (
            CompanyId tinyint NOT NULL, CountryId nvarchar(2) NOT NULL, CountryName nvarchar(50) NOT NULL,
            CountryNameArb nvarchar(50) NULL, SortOrder int NULL,
            CONSTRAINT PK_rfCountry PRIMARY KEY (CompanyId, CountryId)
        );

        CREATE TABLE dbo.rfCurrency
        (
            CompanyId tinyint NOT NULL, CurId nvarchar(5) NOT NULL, CurName nvarchar(50) NOT NULL,
            CurNameArb nvarchar(50) NULL, CurRate float NULL, CurDecimal smallint NULL,
            CONSTRAINT PK_rfCurrency PRIMARY KEY (CompanyId, CurId)
        );

        CREATE TABLE dbo.Api_UserCredential
        (
            CompanyId tinyint NOT NULL,
            UserNo nvarchar(3) NOT NULL,
            PasswordHash nvarchar(500) NOT NULL,
            CreatedUtc datetime2 NOT NULL,
            UpdatedUtc datetime2 NOT NULL,
            CONSTRAINT PK_Api_UserCredential PRIMARY KEY (CompanyId, UserNo)
        );

        CREATE TABLE dbo.Api_LoginSecurity
        (
            NormalizedUserName nvarchar(50) NOT NULL PRIMARY KEY,
            FailedAttempts int NOT NULL,
            LockoutUntilUtc datetime2 NULL,
            LastSuccessfulLoginUtc datetime2 NULL,
            UpdatedUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
        );

        CREATE TABLE dbo.Api_PreAuthTicket
        (
            Nonce varchar(32) NOT NULL PRIMARY KEY,
            UserNo nvarchar(3) NOT NULL,
            CompanyId tinyint NOT NULL,
            CreatedUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
            ExpiresUtc datetime2 NOT NULL,
            ConsumedUtc datetime2 NULL
        );

        CREATE TABLE dbo.Api_RefreshToken
        (
            RefreshTokenId bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
            FamilyId uniqueidentifier NOT NULL, CompanyId tinyint NOT NULL, LocationId tinyint NOT NULL,
            UserNo nvarchar(3) NOT NULL, TokenHash char(64) NOT NULL UNIQUE, ExpiresUtc datetime2 NOT NULL,
            CreatedUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(), RevokedUtc datetime2 NULL, ReplacedByTokenHash char(64) NULL
        );
        """;

        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        await command.ExecuteNonQueryAsync();
    }

    public async Task ResetAsync()
    {
        await using var connection = new SqlConnection(ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            DELETE FROM dbo.Api_RefreshToken;
            DELETE FROM dbo.Api_PreAuthTicket;
            DELETE FROM dbo.Api_LoginSecurity;
            DELETE FROM dbo.Api_UserCredential;
            DELETE FROM dbo.Sys_UserCompanyYear;
            DELETE FROM dbo.rfSalesMan;
            DELETE FROM dbo.rfPayType;
            DELETE FROM dbo.rfArea;
            DELETE FROM dbo.rfCountry;
            DELETE FROM dbo.rfCurrency;
            DELETE FROM dbo.Sys_PermGroupsModule;
            DELETE FROM dbo.Sys_UserLocation;
            DELETE FROM dbo.Sys_UserCompany;
            DELETE FROM dbo.Sys_Location;
            DELETE FROM dbo.Sys_Company;
            DELETE FROM dbo.Sys_User;
            """;
        await command.ExecuteNonQueryAsync();
    }

    public async Task DisposeAsync() => await _container.DisposeAsync();
}
