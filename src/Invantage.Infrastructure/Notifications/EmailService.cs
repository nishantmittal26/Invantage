using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Invantage.Application.Common.Interfaces;
using Invantage.Infrastructure.Data;

namespace Invantage.Infrastructure.Notifications
{
    public class EmailService : IEmailService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EmailService> _logger;

        public EmailService(ApplicationDbContext context, ILogger<EmailService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var settings = await _context.CompanySettings.FirstOrDefaultAsync();
            if (settings != null && settings.EnableSmtp && !string.IsNullOrEmpty(settings.SmtpHost))
            {
                try
                {
                    using var message = new MailMessage();
                    message.From = new MailAddress(settings.SmtpEmail, settings.CompanyName);
                    message.To.Add(new MailAddress(to));
                    message.Subject = subject;
                    message.Body = body;
                    message.IsBodyHtml = true;

                    using var client = new SmtpClient(settings.SmtpHost, settings.SmtpPort);
                    client.Credentials = new NetworkCredential(settings.SmtpEmail, settings.SmtpPassword);
                    client.EnableSsl = true;

                    await client.SendMailAsync(message);
                    _logger.LogInformation("Email sent successfully to {To}", to);
                    return;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send email to {To} via SMTP", to);
                }
            }

            // Fallback mock logger
            _logger.LogWarning("SMTP disabled or not configured. [MOCK EMAIL SENT]\nTo: {To}\nSubject: {Subject}\nBody: {Body}", to, subject, body);
            await Task.CompletedTask;
        }
    }
}
