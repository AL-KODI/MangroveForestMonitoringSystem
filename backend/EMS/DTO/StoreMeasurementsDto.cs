namespace EMS.DTO
{
    public class StoreMeasurementsDto
    {
        public int id { get; set; }

        public Dictionary<int, double> Vals { get; set; } = new Dictionary<int, double>();
        public int TId { get; set; }
    }
}
