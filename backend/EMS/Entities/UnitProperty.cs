namespace EMS.Entities
{
    public class UnitProperty
    {
        public int UnitPropertyId { get; set; }
        public int UnitId { get; set; }

        public int PropertyId { get; set; }
        public DateTime TimeStamp { get; set; } = DateTime.UtcNow;

        //Navigations
        public Unit Unit { get; set; } = null!;
       


    }
}
