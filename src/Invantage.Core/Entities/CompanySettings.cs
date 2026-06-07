using System;

namespace Invantage.Core.Entities
{
    public class CompanySettings
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string CompanyName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string GSTNumber { get; set; } = string.Empty;
        public string? Logo { get; set; } // Base64 or Image path

        // SMTP settings
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public string SmtpEmail { get; set; } = string.Empty;
        public string SmtpPassword { get; set; } = string.Empty;
        public bool EnableSmtp { get; set; } = false;
    }
}
