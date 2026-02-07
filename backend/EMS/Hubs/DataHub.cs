namespace EMS.Hubs
{
    using Microsoft.AspNetCore.SignalR;

    public class DataHub : Hub
    {
        public async Task SendData(int value)
        {
            await Clients.All.SendAsync("ReceiveData", value);
        }
    }
}
