# Matrix API integration tests

These tests exercise the login module through the real ASP.NET Core HTTP pipeline and a real SQL Server instance.

## Prerequisites

- .NET 10 SDK
- Docker Desktop / Docker Engine
- Network access to pull `mcr.microsoft.com/mssql/server:2022-latest` on the first run

## Run

From the solution directory:

```bash
dotnet test
```

Testcontainers starts an isolated SQL Server container for the test collection, creates the minimum Matrix schema required by the authentication module, and resets test data before every test.

## Coverage

- legacy password authentication
- automatic legacy-to-modern password migration
- modern password authentication
- generic invalid-credential response
- failed-login tracking
- account lockout
- multi-company/location context selection
- one-time pre-auth ticket
- unauthorized context selection
- JWT authentication and `/api/auth/me`
- malformed JWT rejection
- module authorization from `Sys_PermGroupsModule`
- no use of `Sys_Location` database-routing fields
