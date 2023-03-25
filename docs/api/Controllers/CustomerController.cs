using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Attributes;

using Api.Data;
using Api.Models;

namespace Api.Controllers;
[ApiController]
[Route("[controller]")]
public class CustomerController : ControllerBase
{
    private readonly ApiContext _context;
    public CustomerController(ApiContext context)
    {
        _context = context;
    }

    [EnableQuery]
    [ODataAttributeRouting]
    [HttpGet("~/customers")]
    public IActionResult OData()
    {
        return Ok(_context.Customers);
    }
}
