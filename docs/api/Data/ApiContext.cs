using Microsoft.EntityFrameworkCore;

using Api.Models;

namespace Api.Data;
public class ApiContext : DbContext
{
    public ApiContext(DbContextOptions options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Address>()
            .HasOne(a => a.Customer)
            .WithMany(c => c.Addresses)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Customer>()
            .HasMany(c => c.Orders)
            .WithOne(o => o.Customer)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Order>()
            .HasOne(o => o.DeliveryAddress)
            .WithMany()
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Order>()
            .HasMany(o => o.OrderProducts)
            .WithOne(op => op.Order)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<OrderProduct>()
            .HasOne(op => op.Product)
            .WithMany()
            .OnDelete(DeleteBehavior.Cascade);

    }

    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();

}