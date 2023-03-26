using Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

public abstract class ODataBaseController<T> : ODataController
    where T : class
{
    private readonly ApiContext _context;

    public ODataBaseController(ApiContext context)
    {
        _context = context;
    }

    [HttpGet]
    [EnableQuery(MaxAnyAllExpressionDepth = 5, MaxExpansionDepth = 5, PageSize = 250)]
    public IActionResult Get()
    {
        return Ok(_context.Set<T>().AsNoTracking());
    }
}