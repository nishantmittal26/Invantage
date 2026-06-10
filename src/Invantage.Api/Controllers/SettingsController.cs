using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Invantage.Api.Security;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.DTOs.Settings;

namespace Invantage.Api.Controllers
{
    [Authorize(Roles = "MasterAdmin")]
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : BaseApiController
    {
        private readonly ISettingsService _settingsService;

        public SettingsController(ISettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        [HttpGet("company")]
        [HasPermission("Settings:View")]
        public async Task<IActionResult> GetCompanySettings()
        {
            var response = await _settingsService.GetCompanySettingsAsync();
            return Ok(response);
        }

        [HttpPut("company")]
        [HasPermission("Settings:Edit")]
        public async Task<IActionResult> UpdateCompanySettings([FromBody] CompanySettingsDto request)
        {
            var response = await _settingsService.UpdateCompanySettingsAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet("smtp")]
        [HasPermission("Settings:View")]
        public async Task<IActionResult> GetSmtpSettings()
        {
            var response = await _settingsService.GetSmtpSettingsAsync();
            return Ok(response);
        }

        [HttpPut("smtp")]
        [HasPermission("Settings:Edit")]
        public async Task<IActionResult> UpdateSmtpSettings([FromBody] SmtpSettingsDto request)
        {
            var response = await _settingsService.UpdateSmtpSettingsAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet("auditlogs")]
        [HasPermission("Settings:View")]
        public async Task<IActionResult> GetAuditLogs(
            [FromQuery] string? user, 
            [FromQuery] string? entity, 
            [FromQuery] string? action, 
            [FromQuery] DateTime? startDate, 
            [FromQuery] DateTime? endDate)
        {
            var response = await _settingsService.GetAuditLogsAsync(user, entity, action, startDate, endDate);
            return Ok(response);
        }
    }
}
