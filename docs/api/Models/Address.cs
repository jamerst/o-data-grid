namespace Api.Models {
    public class Address {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public Customer Customer { get; set; } = null!;
        public string Line1 { get; set; } = null!;
        public string? Line2 { get; set; }
        public string? Line3 { get; set; }
        public string Town { get; set; } = null!;
        public string? County { get; set; }
        public string Country { get; set; } = null!;
        public string PostCode { get; set; } = null!;
    }
}