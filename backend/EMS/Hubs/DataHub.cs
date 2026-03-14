namespace EMS.Hubs
{
    using EMS.Entities;
    using Microsoft.AspNetCore.SignalR;

    public class DataHub : Hub
    {
        public async Task SendData(Measurement value,int UnitId)
        {
            await Clients.All.SendAsync("UpdateMeasurements", value,UnitId);
        }
    }
}
