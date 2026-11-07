using Matrix.Api.Models.Parties;
using Matrix.Api.Services.Validation;

namespace Matrix.Api.IntegrationTests;

public sealed class PartyValidatorTests
{
    private readonly PartyValidator _validator = new();

    [Fact]
    public void Valid_party_request_passes()
    {
        var result = _validator.Validate(new SavePartyRequest { Name = "ABC Trading", CreditDays = 30, CreditLimit = 5000, PurePurity = 999 });
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Blank_name_is_rejected()
    {
        var result = _validator.Validate(new SavePartyRequest { Name = " " });
        Assert.Contains(result.Errors, x => x.Code == "PARTY_NAME_REQUIRED");
    }

    [Fact]
    public void Negative_credit_values_are_rejected()
    {
        var result = _validator.Validate(new SavePartyRequest { Name = "ABC", CreditDays = -1, CreditLimit = -1 });
        Assert.Contains(result.Errors, x => x.Code == "CREDIT_DAYS_INVALID");
        Assert.Contains(result.Errors, x => x.Code == "CREDIT_LIMIT_INVALID");
    }
}
