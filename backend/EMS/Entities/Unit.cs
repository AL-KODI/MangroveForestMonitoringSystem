namespace EMS.Entities
{
    public class Unit
    {
        public int UnitId { get; set; }
        public string UnitName { get; set; } = string.Empty;
        public string UnitDescription { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public List<UnitProperty> UnitProperties { get; set; } = new(); 
    }
}
