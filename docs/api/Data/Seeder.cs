using Api.Models;
using Bogus;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public interface ISeeder
{
    Task Seed(CancellationToken token);
}

public class Seeder : ISeeder
{
    private readonly ApiContext _context;

    public Seeder(ApiContext context)
    {
        _context = context;
    }

    public async Task Seed(CancellationToken token)
    {
        if (await _context.Customers.AnyAsync(token))
        {
            return;
        }

        var productFaker = new Faker<Product>()
            .RuleFor(p => p.Name, f => f.Commerce.ProductName())
            .RuleFor(p => p.Price, f => Math.Round(f.Random.Decimal(0, 500), 2))
            .FinishWith((_, _) => token.ThrowIfCancellationRequested());

        List<Product> products = productFaker.GenerateBetween(100, 200);

        int line1Index = 0;
        var addressFaker = new Faker<Address>()
            .RuleFor(a => a.Line1, f => f.PickRandomParam(out line1Index, f.Address.StreetAddress(), f.Address.SecondaryAddress()))
            .RuleFor(a => a.Line2, f => line1Index == 1 ? f.Address.StreetAddress() : null)
            .RuleFor(a => a.Line3, f => f.Address.City().OrNull(f, .9f))
            .RuleFor(a => a.Town, f => f.Address.City())
            .RuleFor(a => a.Country, f => f.Address.Country())
            .RuleFor(a => a.County, (f, a) => a.Country == "United Kingdom"
                ? f.Address.County().OrNull(f)
                : null)
            .RuleFor(a => a.PostCode, f => f.Address.ZipCode())
            .FinishWith((_, _) => token.ThrowIfCancellationRequested());

        var orderProductFaker = new Faker<OrderProduct>()
            .RuleFor(op => op.Product, f => f.PickRandom(products))
            .RuleFor(op => op.Quantity, f => f.Random.Int(1, 5))
            .FinishWith((_, _) => token.ThrowIfCancellationRequested());

        var orderFaker = new Faker<Order>()
            .RuleFor(o => o.Date, f => f.Date.PastOffset(5).ToUniversalTime())
            .RuleFor(o => o.OrderProducts, _ => orderProductFaker.GenerateBetween(1, 5))
            .FinishWith((_, o) =>
            {
                token.ThrowIfCancellationRequested();
                o.Total = o.OrderProducts.Sum(op => op.Product.Price * op.Quantity);
            });

        var customerFaker = new Faker<Customer>()
            .RuleFor(c => c.FirstName, f => f.Name.FirstName())
            .RuleFor(c => c.MiddleNames, f => f.Name.FirstName().OrNull(f))
            .RuleFor(c => c.Surname, f => f.Name.LastName())
            .RuleFor(c => c.EmailAddress, (f, c) => f.Internet.ExampleEmail(c.FirstName, c.Surname))
            .RuleFor(c => c.Addresses, _ => addressFaker.GenerateBetween(1, 3))
            .RuleFor(c => c.Orders, _ => orderFaker.GenerateBetween(0, 10))
            .FinishWith((f, c) =>
            {
                token.ThrowIfCancellationRequested();
                foreach (var order in c.Orders)
                {
                    order.DeliveryAddress = f.PickRandom(c.Addresses);
                }

                c.CreatedDate = c.Orders.Select(o => o.Date).DefaultIfEmpty(f.Date.PastOffset(5).ToUniversalTime()).Min();
            });

        List<Customer> customers = customerFaker.GenerateBetween(800, 1200);

        _context.Customers.AddRange(customers);
        await _context.SaveChangesAsync(token);
    }
}