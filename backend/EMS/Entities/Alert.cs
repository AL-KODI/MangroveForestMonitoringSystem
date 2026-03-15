namespace EMS.Entities
{
    public class Alert
    {
        public int AlertId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "CRITICAL";
        public string Source { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}