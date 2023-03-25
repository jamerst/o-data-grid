namespace Api.Models;
public class Address
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public required Customer Customer { get; set; }
    public required string Line1 { get; set; }
    public string? Line2 { get; set; }
    public string? Line3 { get; set; }
    public required string Town { get; set; }
    public string? County { get; set; }
    public required string Country { get; set; }
    public required string PostCode { get; set; }
}