using Microsoft.AspNetCore.Mvc;

namespace EMS.Controllers
{
    using EMS.Hubs;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.SignalR;

    [ApiController]
   
    [Route("Data")]
    public class DataController : ControllerBase
    {
        private readonly IHubContext<DataHub> _hub;

        public DataController(IHubContext<DataHub> hub)
        {
            _hub = hub;
        }

        [Authorize]
        [HttpGet("{value}")]
        public async Task<IActionResult> Send(int value)
        {
            await _hub.Clients.All.SendAsync("ReceiveData", value);
            return Ok();

        }
       


    }
}
