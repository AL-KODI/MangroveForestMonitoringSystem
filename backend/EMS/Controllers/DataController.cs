using Microsoft.AspNetCore.Mvc;

namespace EMS.Controllers
{
    using EMS.Data;
    using EMS.DTO;
    using EMS.Entities;
    using EMS.Hubs;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.SignalR;
    using Microsoft.EntityFrameworkCore;
    using Newtonsoft.Json.Linq;

    [ApiController]
   
    [Route("Data")]
    public class DataController : ControllerBase
    {
        private readonly IHubContext<DataHub> _hub;
        private AppDbContext _context;

        public DataController( AppDbContext context, IHubContext<DataHub> hub)
        {
            
            _context = context;
            _hub = hub;
        }
       

        
        [HttpGet("{value}")]
        public async Task<IActionResult> Send(int value)
        {
            Console.WriteLine(value);
           // await _hub.Clients.All.SendAsync("ReceiveData", value);
            return Ok();

        }
        [Authorize]
        [HttpPost("AddUnit")]
        public async Task<IActionResult> AddUnit([FromBody] AddUnitDto model)
        {
            if (!ModelState.IsValid) {
                Console.WriteLine("Bad Model");
                return BadRequest(new {error = "Model not valid" });
            }
            var unit = new Unit
            {
                UnitName = model.UnitName,
                UnitDescription = model.UnitDescription,
                Location = model.Location
            };

            _context.Units.Add(unit);
            await _context.SaveChangesAsync();
            return Ok();

        }
        [Authorize]
        [HttpPost("AddProperty")]
        public async Task<IActionResult> AddProperty([FromBody] AddPropertyDto model)
        {
            if (!ModelState.IsValid)
            {
                Console.WriteLine("Bad Model");
                return BadRequest(new { error = "Model not valid" });
            }
            var property = new Property
            {
                PropertyName = model.PropertyName,
                MinValue = model.MinValue,
                MaxValue = model.MaxValue,
                Description = model.Description,
                MeasuringUnit = model.MeasuringUnit
            };

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();
            return Ok();

        }

        [Authorize]
        [HttpPost("getunits")]
        public async Task<IActionResult> GetUnits()
        {
            Console.WriteLine("Check Units");
            var units = await _context.Units.ToListAsync();
            return Ok(units);
        }

        [Authorize]
        [HttpPost("getproperties")]
        public async Task<IActionResult> GetProperties()
        {
            Console.WriteLine("Getting Properties");
            var properties = await _context.Properties.ToListAsync();
            return Ok(properties);
        }

        [Authorize]
        [HttpPost("addunitproperty")]
        public async Task<IActionResult> AddUnitProperty([FromBody] AddUnitPropertyDto model)
        {
            Console.WriteLine("Adding a Property for a unit");
            var unitproperty = new UnitProperty
            {
                UnitId = model.uid,
                PropertyId = model.pid
            };
      
            try
            {
                _context.UnitProperties.Add(unitproperty);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return Ok("This Unit and Property combination already exists.");
            }

            return Ok();
        }

        [Authorize]
        [HttpPost("getunitproperties")]
        public async Task<IActionResult> GetUnitProperties([FromBody] GettingUnitPropertiesDto model)
        {
            Console.WriteLine("Getting Unit Properties");
            var propertyIds = await _context.UnitProperties
                .Where(u => u.UnitId == model.UnitId)
                .Select(u => u.PropertyId)
                .ToArrayAsync();

           

            var properties = await _context.Properties
                .Where(p => propertyIds.Contains(p.PropertyId))
                .ToListAsync();

            
            
            return Ok(properties);
        }

        [Authorize]
        [HttpPost("getmeasurements")]
        public async Task<IActionResult> GetMeasurements([FromBody] GetMeasurementsDto model)
        {
            Console.WriteLine("Getting Unit Properties");
            var unitpropertyIds = await _context.UnitProperties
                .Where(u => u.UnitId == model.id)
                .Select(u => u.UnitPropertyId)
                .ToArrayAsync();



            var measurements = await _context.Measurements
                .Where(m => unitpropertyIds.Contains(m.UnitPropertyId))
                .ToListAsync();



            return Ok(measurements);
        }

        [HttpPost("sendunitdata")]
        public async Task<IActionResult> StoreMeasurements([FromBody] StoreMeasurementsDto model)
        {


            Console.WriteLine("*********************************************************************");
            foreach (var item in model.Vals)
            {
               Console.WriteLine("*************");
               Console.WriteLine($"PropertyId: {item.Key} Value: {item.Value}");
                var UPId = await _context.UnitProperties
                    .Where(u => u.UnitId == model.id && u.PropertyId == item.Key)
                    .Select(u => u.UnitPropertyId)
                    .FirstOrDefaultAsync();
                var measurement = new Measurement
                {
                    UnitPropertyId = UPId,
                    PropertyId = item.Key,
                    Value = item.Value,
                    TimeId = model.TId
                };

                _context.Measurements.Add(measurement);
                await _context.SaveChangesAsync();

                var max = await _context.Properties
                    .Where(x => x.PropertyId == item.Key)
                    .Select(x => x.MaxValue)
                    .FirstOrDefaultAsync();

                var min = await _context.Properties
                    .Where(x => x.PropertyId == item.Key)
                    .Select(x => x.MinValue)
                    .FirstOrDefaultAsync();
                if(item.Value >= max ||  item.Value <= min)
                {
                    var alert = "Annomally Detected at " + model.id + " Property = " + item.Key;
                    Console.WriteLine(alert);
                    await _hub.Clients.All.SendAsync("Alerts", alert);
                }


            }

            Console.WriteLine("Getting Unit Properties for real time updates $$$$$$$$$$$$$$$$");
            var unitpropertyIds = await _context.UnitProperties
                .Where(u => u.UnitId == model.id)
                .Select(u => u.UnitPropertyId)
                .ToArrayAsync();



            var measurements = await _context.Measurements
                .Where(m => unitpropertyIds.Contains(m.UnitPropertyId))
                .ToListAsync();

            await _hub.Clients.All.SendAsync("UpdateMeasurements", measurements,model.id);

            return Ok();
        }
    }
}
