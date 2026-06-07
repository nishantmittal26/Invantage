using System;

namespace Invantage.Core.Entities
{
    public class AuditLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string User { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty; // Login, Logout, Add, Edit, Delete, etc.
        public string Entity { get; set; } = string.Empty; // Products, Warehouses, etc.
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Details { get; set; } = string.Empty; // Description of change
        public string? IpAddress { get; set; }
    }
}
