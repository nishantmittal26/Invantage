using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Security;

namespace Invantage.Application.Common.Interfaces
{
    public interface IRoleService
    {
        Task<GenericResponse<List<RoleDto>>> GetRolesAsync();
        Task<GenericResponse<RoleDto>> GetRoleByIdAsync(Guid id);
        Task<GenericResponse<RoleDto>> CreateRoleAsync(CreateRoleRequest request);
        Task<GenericResponse<RoleDto>> UpdateRoleAsync(UpdateRoleRequest request);
        Task<GenericResponse<bool>> DeleteRoleAsync(Guid id);
        Task<GenericResponse<List<PermissionDto>>> GetPermissionsAsync();
        Task<GenericResponse<List<RolePermissionDto>>> GetRolePermissionsAsync(Guid roleId);
        Task<GenericResponse<bool>> UpdateRolePermissionsAsync(Guid roleId, List<RolePermissionDto> permissions);
    }
}
