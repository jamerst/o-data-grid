namespace Api.Models;
public class Order {
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int DeliveryAddressId { get; set; }
    public Address DeliveryAddress { get; set; } = null!;
    public decimal Total { get; set; }
    public List<OrderProduct> Products { get; set; } = null!;
}