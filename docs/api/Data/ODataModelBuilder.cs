using Microsoft.OData.ModelBuilder;
using Microsoft.OData.Edm;

using Api.Models;

namespace Api.Data;
public static class ODataModelBuilder
{
    public static IEdmModel Build()
    {
        var builder = new ODataConventionModelBuilder();

        builder.EntitySet<Customer>("Customer");

        return builder.GetEdmModel();
    }
}