using Bogus;

namespace Api.Data;

public static class FakerExtensions
{
    public static T PickRandomParam<T>(this Faker faker, out int index, params T[] items)
    {
        index = faker.Random.Int(0, items.Length - 1);
        return items[index];
    }
}