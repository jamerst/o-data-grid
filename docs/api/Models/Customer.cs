namespace Api.Models;
public class Customer
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public string? MiddleNames { get; set; }
    public required string Surname { get; set; }
    public required string EmailAddress { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public required List<Address> Addresses { get; set; }
    public required List<Order> Orders { get; set; }
}