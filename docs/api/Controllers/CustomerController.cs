using Api.Data;
using Api.Models;

namespace Api.Controllers;

public class CustomerController : ODataBaseController<Customer>
{
    public CustomerController(ApiContext context) : base(context) { }
}
