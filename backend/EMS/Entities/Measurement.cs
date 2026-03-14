namespace EMS.Entities
{
    public class Measurement
    {
        public int MeasurementId { get; set; }
        
        public int UnitPropertyId { get; set; }

        public int PropertyId { get; set; }

        public long TimeId { get; set; }

        public DateTime TimeStamp { get; set; } = DateTime.UtcNow;
        public double Value { get; set; }

        //Navigations
        public UnitProperty UnitProperty { get; set; } = null!;


    }
}
