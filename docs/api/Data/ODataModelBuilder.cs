using Microsoft.OData.ModelBuilder;
using Microsoft.OData.Edm;

namespace Api.Data {
    public static class ODataModelBuilder {
        public static IEdmModel Build() {
            var builder = new ODataConventionModelBuilder();

            return builder.GetEdmModel();
        }
    }
}