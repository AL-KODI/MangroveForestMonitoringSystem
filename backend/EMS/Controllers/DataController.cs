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
                if (item.Value >= max || item.Value <= min)
{
    var propertyName = await _context.Properties
        .Where(x => x.PropertyId == item.Key)
        .Select(x => x.PropertyName)
        .FirstOrDefaultAsync();

    var alertMessage = $"Anomaly detected at Unit {model.id} — {propertyName} value {item.Value} is out of range [{min}, {max}]";

    var newAlert = new Alert
    {
        Message = alertMessage,
        Type = "CRITICAL",
        Source = $"Unit {model.id} - {propertyName}",
        Timestamp = DateTime.UtcNow
    };

    _context.Alerts.Add(newAlert);
    await _context.SaveChangesAsync();

    Console.WriteLine(alertMessage);
    await _hub.Clients.All.SendAsync("Alerts", alertMessage);
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
        [Authorize]
[HttpPost("getalerts")]
public async Task<IActionResult> GetAlerts()
{
    var alerts = await _context.Alerts
        .OrderByDescending(a => a.Timestamp)
        .Take(50)
        .Select(a => new AlertResponseDto
        {
            Message = a.Message,
            Type = a.Type,
            Source = a.Source,
            Timestamp = a.Timestamp.ToString("yyyy-MM-dd HH:mm:ss")
        })
        .ToListAsync();

    return Ok(alerts);
}

[Authorize]
[HttpPost("getdashboardsummary")]
public async Task<IActionResult> GetDashboardSummary()
{
    // Get all properties that exist in the database
    var allProperties = await _context.Properties
        .Where(p => p.PropertyName != null && p.PropertyName != "")
        .ToListAsync();

    var result = new List<DashboardSummaryDto>();

    foreach (var property in allProperties)
    {
        // Get the latest measurement for this property across all units
        var latest = await _context.Measurements
            .Where(m => m.PropertyId == property.PropertyId)
            .OrderByDescending(m => m.TimeStamp)
            .Select(m => m.Value)
            .FirstOrDefaultAsync();

        result.Add(new DashboardSummaryDto
        {
            PropertyName = property.PropertyName,
            Value = latest == 0 ? "--" : latest.ToString("F1"),
            MeasuringUnit = property.MeasuringUnit
        });
    }

    return Ok(result);
}
[Authorize]
[HttpPost("getalldashboarddata")]
public async Task<IActionResult> GetAllDashboardData()
{
    try
    {
        var measurements = await _context.Measurements.ToListAsync();
        var unitProperties = await _context.UnitProperties.ToListAsync();
        var units = await _context.Units.ToListAsync();
        var properties = await _context.Properties
            .Where(p => p.PropertyName != null && p.PropertyName != "")
            .ToListAsync();

        var result = new List<DashboardDataDto>();

        foreach (var m in measurements)
        {
            var up = unitProperties.FirstOrDefault(x => x.UnitPropertyId == m.UnitPropertyId);
            if (up == null) continue;

            var unit = units.FirstOrDefault(x => x.UnitId == up.UnitId);
            if (unit == null) continue;

            var property = properties.FirstOrDefault(x => x.PropertyId == m.PropertyId);
            if (property == null) continue;

            result.Add(new DashboardDataDto
            {
                UnitId       = unit.UnitId,
                UnitName     = unit.UnitName,
                PropertyId   = property.PropertyId,
                PropertyName = property.PropertyName,
                Value        = m.Value,
                Timestamp    = m.TimeStamp.ToString("yyyy-MM-dd HH:mm:ss")
            });
        }

        return Ok(result.OrderByDescending(x => x.Timestamp).Take(500).ToList());
    }
    catch (Exception ex)
    {
        Console.WriteLine("Error in GetAllDashboardData: " + ex.Message);
        return StatusCode(500, new { error = ex.Message });
    }
}
    }
}
