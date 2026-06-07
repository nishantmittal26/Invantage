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
using Invantage.Core.Enums;

namespace Invantage.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public NotificationService(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<GenericResponse<List<NotificationDto>>> GetNotificationsAsync()
        {
            var notifications = await _context.Notifications
                .OrderByDescending(n => n.Timestamp)
                .ToListAsync();

            var dtos = _mapper.Map<List<NotificationDto>>(notifications);
            return GenericResponse<List<NotificationDto>>.Success(dtos);
        }

        public async Task<GenericResponse<bool>> MarkAsReadAsync(Guid id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return GenericResponse<bool>.Failure("Notification not found.");
            }

            notification.IsRead = true;
            _context.Notifications.Update(notification);
            await _context.SaveChangesAsync();

            return GenericResponse<bool>.Success(true, "Notification marked as read.");
        }

        public async Task<GenericResponse<bool>> MarkAllAsReadAsync()
        {
            var unread = await _context.Notifications.Where(n => !n.IsRead).ToListAsync();
            foreach (var n in unread)
            {
                n.IsRead = true;
            }

            _context.Notifications.UpdateRange(unread);
            await _context.SaveChangesAsync();

            return GenericResponse<bool>.Success(true, "All notifications marked as read.");
        }

        public async Task<GenericResponse<NotificationDto>> CreateNotificationAsync(string message, string type, Guid? userId)
        {
            Enum.TryParse<NotificationType>(type, out var notifType);

            var notification = new Notification
            {
                Message = message,
                Type = notifType,
                IsRead = false,
                Timestamp = DateTime.UtcNow,
                UserId = userId
            };

            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            var dto = _mapper.Map<NotificationDto>(notification);
            return GenericResponse<NotificationDto>.Success(dto, "Notification created.");
        }

        public async Task<GenericResponse<bool>> DeleteNotificationAsync(Guid id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return GenericResponse<bool>.Failure("Notification not found.");
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return GenericResponse<bool>.Success(true, "Notification deleted.");
        }
    }
}
