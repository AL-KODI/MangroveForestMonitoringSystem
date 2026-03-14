namespace EMS.DTO
{
    public class AddPropertyDto
    {
        public string PropertyName { get; set;} = string.Empty;

        public int MaxValue { get; set; }

        public int MinValue { get; set; }

        public string Description { get; set; } = string.Empty;

        public string MeasuringUnit { get; set; } = string.Empty; 
    }
}
