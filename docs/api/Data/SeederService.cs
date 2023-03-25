namespace Api.Data;

public class SeederService : IHostedService
{
    public IServiceProvider _provider;

    public SeederService(IServiceProvider provider)
    {
        _provider = provider;
    }

    public async Task StartAsync(CancellationToken token)
    {
        await using (var scope =_provider.CreateAsyncScope())
        {
            var seeder = scope.ServiceProvider.GetRequiredService<ISeeder>();
            await seeder.Seed(token);
        }
    }

    public Task StopAsync(CancellationToken token) => Task.CompletedTask;
}