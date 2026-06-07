using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Settings;
using Invantage.Core.Entities;

namespace Invantage.Application.Services
{
    public class SettingsService : ISettingsService
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public SettingsService(
            IApplicationDbContext context,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<GenericResponse<CompanySettingsDto>> GetCompanySettingsAsync()
        {
            var settings = await _context.CompanySettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new CompanySettings
                {
                    CompanyName = "Invantage Enterprise Solutions",
                    Address = "Default Address",
                    GSTNumber = "Default GST"
                };
                await _context.CompanySettings.AddAsync(settings);
                await _context.SaveChangesAsync();
            }

            var dto = _mapper.Map<CompanySettingsDto>(settings);
            return GenericResponse<CompanySettingsDto>.Success(dto);
        }

        public async Task<GenericResponse<CompanySettingsDto>> UpdateCompanySettingsAsync(CompanySettingsDto request)
        {
            var settings = await _context.CompanySettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new CompanySettings();
                await _context.CompanySettings.AddAsync(settings);
            }

            settings.CompanyName = request.CompanyName;
            settings.Address = request.Address;
            settings.GSTNumber = request.GSTNumber;
            
            if (!string.IsNullOrEmpty(request.Logo))
            {
                settings.Logo = request.Logo; // Base64 or URL
            }

            _context.CompanySettings.Update(settings);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync("Edit", "Settings", "Updated Company Settings");

            var dto = _mapper.Map<CompanySettingsDto>(settings);
            return GenericResponse<CompanySettingsDto>.Success(dto, "Company settings updated successfully.");
        }

        public async Task<GenericResponse<SmtpSettingsDto>> GetSmtpSettingsAsync()
        {
            var settings = await _context.CompanySettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new CompanySettings();
                await _context.CompanySettings.AddAsync(settings);
                await _context.SaveChangesAsync();
            }

            var dto = _mapper.Map<SmtpSettingsDto>(settings);
            return GenericResponse<SmtpSettingsDto>.Success(dto);
        }

        public async Task<GenericResponse<SmtpSettingsDto>> UpdateSmtpSettingsAsync(SmtpSettingsDto request)
        {
            var settings = await _context.CompanySettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new CompanySettings();
                await _context.CompanySettings.AddAsync(settings);
            }

            settings.SmtpHost = request.SmtpHost;
            settings.SmtpPort = request.SmtpPort;
            settings.SmtpEmail = request.SmtpEmail;
            if (!string.IsNullOrEmpty(request.SmtpPassword))
            {
                settings.SmtpPassword = request.SmtpPassword;
            }
            settings.EnableSmtp = request.EnableSmtp;

            _context.CompanySettings.Update(settings);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync("Edit", "Settings", "Updated SMTP Configuration settings");

            var dto = _mapper.Map<SmtpSettingsDto>(settings);
            return GenericResponse<SmtpSettingsDto>.Success(dto, "SMTP email settings updated successfully.");
        }

        public async Task<GenericResponse<List<AuditLogDto>>> GetAuditLogsAsync(string? user, string? entity, string? action, DateTime? startDate, DateTime? endDate)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(user))
            {
                query = query.Where(a => a.User.Contains(user));
            }
            if (!string.IsNullOrEmpty(entity))
            {
                query = query.Where(a => a.Entity.Contains(entity));
            }
            if (!string.IsNullOrEmpty(action))
            {
                query = query.Where(a => a.Action.Contains(action));
            }
            if (startDate.HasValue)
            {
                query = query.Where(a => a.Timestamp >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                query = query.Where(a => a.Timestamp <= endDate.Value);
            }

            var logs = await query.OrderByDescending(a => a.Timestamp).Take(200).ToListAsync();
            var dtos = _mapper.Map<List<AuditLogDto>>(logs);
            return GenericResponse<List<AuditLogDto>>.Success(dtos);
        }

        public async Task<GenericResponse<bool>> CreateAuditLogAsync(string action, string entity, string details)
        {
            var log = new AuditLog
            {
                User = _currentUserService.Username ?? "System",
                Action = action,
                Entity = entity,
                Timestamp = DateTime.UtcNow,
                Details = details,
                IpAddress = _currentUserService.IpAddress
            };

            await _context.AuditLogs.AddAsync(log);
            await _context.SaveChangesAsync();

            return GenericResponse<bool>.Success(true);
        }
    }
}
