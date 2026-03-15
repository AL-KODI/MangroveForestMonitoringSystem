namespace EMS.DTO
{
    public class AlertResponseDto
    {
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
    }
}