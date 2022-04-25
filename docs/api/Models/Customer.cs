namespace Api.Models;
public class Customer {
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string? MiddleNames { get; set; }
    public string Surname { get; set; } = null!;
    public string EmailAddress { get; set; } = null!;
    public DateTime CreatedDate { get; set; }
    public List<Address> Addresses { get; set; } = null!;
    public List<Order> Orders { get; set; } = null!;
}