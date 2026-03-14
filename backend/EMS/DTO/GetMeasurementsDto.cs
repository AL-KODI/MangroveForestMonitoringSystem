namespace EMS.DTO
{
    public class GetMeasurementsDto
    {
        public int id { get; set; }
        public int[] propertyIds { get; set; } = Array.Empty<int>();
    }
}
