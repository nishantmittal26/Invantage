using System;

namespace Invantage.Application.DTOs.Settings
{
    public class AuditLogDto
    {
        public Guid Id { get; set; }
        public string User { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Entity { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Details { get; set; } = string.Empty;
        public string? IpAddress { get; set; }
    }

    public class NotificationDto
    {
        public Guid Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // LowStock, ExpiryAlert, etc.
        public bool IsRead { get; set; }
        public DateTime Timestamp { get; set; }
        public Guid? UserId { get; set; }
    }

    public class CompanySettingsDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string GSTNumber { get; set; } = string.Empty;
        public string? Logo { get; set; } // Base64 representation for sending/updating
    }

    public class SmtpSettingsDto
    {
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public string SmtpEmail { get; set; } = string.Empty;
        public string SmtpPassword { get; set; } = string.Empty;
        public bool EnableSmtp { get; set; }
    }
}
