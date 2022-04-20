namespace Api.Models {
    public class Product {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
    }
}