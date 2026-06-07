using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Settings;

namespace Invantage.Application.Common.Interfaces
{
    public interface INotificationService
    {
        Task<GenericResponse<List<NotificationDto>>> GetNotificationsAsync();
        Task<GenericResponse<bool>> MarkAsReadAsync(Guid id);
        Task<GenericResponse<bool>> MarkAllAsReadAsync();
        Task<GenericResponse<NotificationDto>> CreateNotificationAsync(string message, string type, Guid? userId);
        Task<GenericResponse<bool>> DeleteNotificationAsync(Guid id);
    }
}
