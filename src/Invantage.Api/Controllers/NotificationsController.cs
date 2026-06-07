using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Invantage.Application.Common.Interfaces;

namespace Invantage.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : BaseApiController
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var response = await _notificationService.GetNotificationsAsync();
            return Ok(response);
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var response = await _notificationService.MarkAsReadAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var response = await _notificationService.MarkAllAsReadAsync();
            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            var response = await _notificationService.DeleteNotificationAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }
    }
}
