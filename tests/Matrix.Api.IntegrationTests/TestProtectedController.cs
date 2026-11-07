using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Matrix.Api.IntegrationTests;

[ApiController]
[Route("api/test")]
public sealed class TestProtectedController : ControllerBase
{
    [HttpGet("sales")]
    [Authorize(Policy = "Sales")]
    public IActionResult Sales() => Ok(new { authorized = true });
}
