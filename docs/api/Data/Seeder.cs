using Api.Models;

namespace Api.Data;

public class Seeder {
    public async Task Seed() {
        List<Customer> customers = new List<Customer>();
        for (int i = 0; i < 1000; i++) {
            customers.Add(new Customer {
                FirstName = Faker.Name.First(),
                MiddleNames = _randomNull(Faker.Name.Middle()),
                Surname = Faker.Name.Last(),
                CreatedDate = _randomDateTime(),
                Addresses = _randomCollection(() => new Address {
                    Line1 = _randomChoice(Faker.Address.StreetAddress(), Faker.Address.SecondaryAddress(), out bool line1Full, 75),
                    Line2 = !line1Full ? Faker.Address.StreetName() : null,
                    Line3 = _randomNull(Faker.Address.City(), 10),
                    Town = Faker.Address.City(),
                    County = _randomNull(Faker.Address.UkCounty(), 90),
                    Country = Faker.Address.UkCountry(),
                    PostCode = Faker.Address.UkPostCode()
                }).ToList()
            });
        }
    }

    private T? _randomNull<T>(T value, int chance = 50) where T : class {
        if (Random.Shared.Next(0, 100) < chance) {
            return value;
        } else {
            return null;
        }
    }

    private T _randomChoice<T>(T val1, T val2, out bool firstChosen, int chance = 50) {
        if (Random.Shared.Next(0, 100) < chance) {
            firstChosen = true;
            return val1;
        } else {
            firstChosen = false;
            return val2;
        }
    }

    private IEnumerable<T> _randomCollection<T>(Func<T> generate, int min = 0, int max = 5) {
        int count = Random.Shared.Next(min, max);

        for (int i = 0; i < count; i++) {
            yield return generate();
        }
    }

    private DateTime _randomDateTime() {
        long range = (_maxDate - _minDate).Ticks;

        return _minDate.AddTicks(Random.Shared.NextInt64(0, range));
    }

    private readonly DateTime _minDate = new DateTime(2010, 01, 01);
    private readonly DateTime _maxDate = DateTime.Now;
}