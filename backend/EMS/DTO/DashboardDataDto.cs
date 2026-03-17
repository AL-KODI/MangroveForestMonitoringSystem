namespace EMS.DTO
{
    public class DashboardDataDto
    {
        public int UnitId { get; set; }
        public string UnitName { get; set; } = string.Empty;
        public int PropertyId { get; set; }
        public string PropertyName { get; set; } = string.Empty;
        public double Value { get; set; }
        public string Timestamp { get; set; } = string.Empty;
    }
}