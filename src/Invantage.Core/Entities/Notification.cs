using System;
using Invantage.Core.Enums;

namespace Invantage.Core.Entities
{
    public class Notification
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; } = NotificationType.SystemAlert;
        public bool IsRead { get; set; } = false;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        public Guid? UserId { get; set; } // Null for system-wide / role-wide notifications
    }
}
