namespace EMS.Entities
{
    public class Property
    {
        public int PropertyId { get; set; }

        public string PropertyName { get; set; } = string.Empty;

        public int MinValue { get; set; }
        public int MaxValue { get; set; }
        public string Description { get; set; } = string.Empty;

        public string MeasuringUnit { get; set; } = string.Empty;



    }
}
