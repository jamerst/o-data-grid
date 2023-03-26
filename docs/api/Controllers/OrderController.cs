using Api.Data;
using Api.Models;

namespace Api.Controllers;

public class OrderController : ODataBaseController<Order>
{
    public OrderController(ApiContext context) : base(context) { }
}
