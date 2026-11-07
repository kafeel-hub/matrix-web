using Xunit;

namespace Matrix.Api.IntegrationTests;

[CollectionDefinition("sqlserver")]
public sealed class IntegrationTestCollection : ICollectionFixture<SqlServerFixture>
{
}
