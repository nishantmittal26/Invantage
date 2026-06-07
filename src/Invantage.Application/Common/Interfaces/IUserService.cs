using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Security;

namespace Invantage.Application.Common.Interfaces
{
    public interface IUserService
    {
        Task<GenericResponse<List<UserDto>>> GetUsersAsync();
        Task<GenericResponse<UserDto>> GetUserByIdAsync(Guid id);
        Task<GenericResponse<UserDto>> CreateUserAsync(CreateUserRequest request);
        Task<GenericResponse<UserDto>> UpdateUserAsync(UpdateUserRequest request);
        Task<GenericResponse<bool>> DeleteUserAsync(Guid id);
        Task<GenericResponse<bool>> ToggleUserStatusAsync(Guid id);
    }
}
