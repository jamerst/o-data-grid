using Api.Data;
using Api.Models;

namespace Api.Controllers;

public class ProductController : ODataBaseController<Product>
{
    public ProductController(ApiContext context) : base(context) { }
}
