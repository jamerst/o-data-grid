using Microsoft.OData.ModelBuilder;
using Microsoft.OData.Edm;

using Api.Models;

namespace Api.Data;
public static class ODataModelBuilder
{
    public static IEdmModel Build()
    {
        var builder = new ODataConventionModelBuilder();

        builder.EntitySet<Customer>(nameof(Customer));
        builder.EntitySet<Order>(nameof(Order));
        builder.EntitySet<Product>(nameof(Product));

        return builder.GetEdmModel();
    }
}