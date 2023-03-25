namespace Api.Models;
public class Order
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public required Customer Customer { get; set; }
    public DateTimeOffset Date { get; set; }
    public int DeliveryAddressId { get; set; }
    public required Address DeliveryAddress { get; set; }
    public decimal Total { get; set; }
    public required List<OrderProduct> OrderProducts { get; set; }
}