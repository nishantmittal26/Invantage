using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Settings;

namespace Invantage.Application.Common.Interfaces
{
    public interface ISettingsService
    {
        Task<GenericResponse<CompanySettingsDto>> GetCompanySettingsAsync();
        Task<GenericResponse<CompanySettingsDto>> UpdateCompanySettingsAsync(CompanySettingsDto request);
        Task<GenericResponse<SmtpSettingsDto>> GetSmtpSettingsAsync();
        Task<GenericResponse<SmtpSettingsDto>> UpdateSmtpSettingsAsync(SmtpSettingsDto request);
        Task<GenericResponse<List<AuditLogDto>>> GetAuditLogsAsync(string? user, string? entity, string? action, DateTime? startDate, DateTime? endDate);
        Task<GenericResponse<bool>> CreateAuditLogAsync(string action, string entity, string details);
    }
}
