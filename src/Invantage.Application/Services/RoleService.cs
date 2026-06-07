using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Security;
using Invantage.Core.Entities.Identity;

namespace Invantage.Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ISettingsService _auditLog;

        public RoleService(
            RoleManager<ApplicationRole> roleManager,
            IApplicationDbContext context,
            IMapper mapper,
            ISettingsService auditLog)
        {
            _roleManager = roleManager;
            _context = context;
            _mapper = mapper;
            _auditLog = auditLog;
        }

        public async Task<GenericResponse<List<RoleDto>>> GetRolesAsync()
        {
            var roles = await _roleManager.Roles.ToListAsync();
            var dtos = new List<RoleDto>();

            foreach (var role in roles)
            {
                var dto = _mapper.Map<RoleDto>(role);
                // Load permissions
                var rolePermissions = await _context.RolePermissions
                    .Include(rp => rp.Permission)
                    .Where(rp => rp.RoleId == role.Id)
                    .ToListAsync();
                dto.Permissions = _mapper.Map<List<RolePermissionDto>>(rolePermissions);
                dtos.Add(dto);
            }

            return GenericResponse<List<RoleDto>>.Success(dtos);
        }

        public async Task<GenericResponse<RoleDto>> GetRoleByIdAsync(Guid id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null)
            {
                return GenericResponse<RoleDto>.Failure("Role not found.");
            }

            var dto = _mapper.Map<RoleDto>(role);
            var rolePermissions = await _context.RolePermissions
                .Include(rp => rp.Permission)
                .Where(rp => rp.RoleId == role.Id)
                .ToListAsync();
            dto.Permissions = _mapper.Map<List<RolePermissionDto>>(rolePermissions);

            return GenericResponse<RoleDto>.Success(dto);
        }

        public async Task<GenericResponse<RoleDto>> CreateRoleAsync(CreateRoleRequest request)
        {
            var exists = await _roleManager.RoleExistsAsync(request.Name);
            if (exists)
            {
                return GenericResponse<RoleDto>.Failure("Role already exists.");
            }

            var role = new ApplicationRole
            {
                Name = request.Name,
                NormalizedName = request.Name.ToUpper(),
                Description = request.Description
            };

            var result = await _roleManager.CreateAsync(role);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return GenericResponse<RoleDto>.Failure("Failed to create role.", errors);
            }

            // Bind permissions if any
            if (request.Permissions != null && request.Permissions.Any())
            {
                foreach (var perm in request.Permissions)
                {
                    var rolePerm = new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = perm.PermissionId,
                        View = perm.View,
                        Add = perm.Add,
                        Edit = perm.Edit,
                        Delete = perm.Delete
                    };
                    await _context.RolePermissions.AddAsync(rolePerm);
                }
                await _context.SaveChangesAsync();
            }

            await _auditLog.CreateAuditLogAsync("Add", "Roles", $"Created role {role.Name}");

            var dto = _mapper.Map<RoleDto>(role);
            return GenericResponse<RoleDto>.Success(dto, "Role created successfully.");
        }

        public async Task<GenericResponse<RoleDto>> UpdateRoleAsync(UpdateRoleRequest request)
        {
            var role = await _roleManager.FindByIdAsync(request.Id.ToString());
            if (role == null)
            {
                return GenericResponse<RoleDto>.Failure("Role not found.");
            }

            role.Name = request.Name;
            role.NormalizedName = request.Name.ToUpper();
            role.Description = request.Description;

            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return GenericResponse<RoleDto>.Failure("Failed to update role.", errors);
            }

            // Sync permissions
            var existingPerms = await _context.RolePermissions.Where(rp => rp.RoleId == role.Id).ToListAsync();
            _context.RolePermissions.RemoveRange(existingPerms);

            if (request.Permissions != null && request.Permissions.Any())
            {
                foreach (var perm in request.Permissions)
                {
                    var rolePerm = new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = perm.PermissionId,
                        View = perm.View,
                        Add = perm.Add,
                        Edit = perm.Edit,
                        Delete = perm.Delete
                    };
                    await _context.RolePermissions.AddAsync(rolePerm);
                }
            }
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Edit", "Roles", $"Updated role {role.Name}");

            var dto = _mapper.Map<RoleDto>(role);
            return GenericResponse<RoleDto>.Success(dto, "Role updated successfully.");
        }

        public async Task<GenericResponse<bool>> DeleteRoleAsync(Guid id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null)
            {
                return GenericResponse<bool>.Failure("Role not found.");
            }

            // Check if default roles are protected
            if (role.Name == "MasterAdmin" || role.Name == "InventoryManager" || role.Name == "StoreUser")
            {
                return GenericResponse<bool>.Failure("Default system roles cannot be deleted.");
            }

            // Check if users are in this role
            var usersInRole = await _context.UserRoles.AnyAsync(ur => ur.RoleId == id);
            if (usersInRole)
            {
                return GenericResponse<bool>.Failure("Cannot delete role. Active users are currently assigned to this role.");
            }

            // Remove associated permissions
            var rolePerms = await _context.RolePermissions.Where(rp => rp.RoleId == id).ToListAsync();
            _context.RolePermissions.RemoveRange(rolePerms);

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded)
            {
                return GenericResponse<bool>.Failure("Failed to delete role.");
            }

            await _context.SaveChangesAsync();
            await _auditLog.CreateAuditLogAsync("Delete", "Roles", $"Deleted role {role.Name}");

            return GenericResponse<bool>.Success(true, "Role deleted successfully.");
        }

        public async Task<GenericResponse<List<PermissionDto>>> GetPermissionsAsync()
        {
            var perms = await _context.Permissions.ToListAsync();
            var dtos = _mapper.Map<List<PermissionDto>>(perms);
            return GenericResponse<List<PermissionDto>>.Success(dtos);
        }

        public async Task<GenericResponse<List<RolePermissionDto>>> GetRolePermissionsAsync(Guid roleId)
        {
            var rolePermissions = await _context.RolePermissions
                .Include(rp => rp.Permission)
                .Where(rp => rp.RoleId == roleId)
                .ToListAsync();

            var dtos = _mapper.Map<List<RolePermissionDto>>(rolePermissions);
            return GenericResponse<List<RolePermissionDto>>.Success(dtos);
        }

        public async Task<GenericResponse<bool>> UpdateRolePermissionsAsync(Guid roleId, List<RolePermissionDto> permissions)
        {
            var role = await _roleManager.FindByIdAsync(roleId.ToString());
            if (role == null)
            {
                return GenericResponse<bool>.Failure("Role not found.");
            }

            // Keep default MasterAdmin permissions intact
            if (role.Name == "MasterAdmin")
            {
                return GenericResponse<bool>.Failure("Permissions for MasterAdmin cannot be modified.");
            }

            var existingPerms = await _context.RolePermissions.Where(rp => rp.RoleId == roleId).ToListAsync();
            _context.RolePermissions.RemoveRange(existingPerms);

            foreach (var perm in permissions)
            {
                var rolePerm = new RolePermission
                {
                    RoleId = roleId,
                    PermissionId = perm.PermissionId,
                    View = perm.View,
                    Add = perm.Add,
                    Edit = perm.Edit,
                    Delete = perm.Delete
                };
                await _context.RolePermissions.AddAsync(rolePerm);
            }

            await _context.SaveChangesAsync();
            await _auditLog.CreateAuditLogAsync("Edit", "Roles", $"Updated permissions matrix for role {role.Name}");

            return GenericResponse<bool>.Success(true, "Role permissions updated successfully.");
        }
    }
}
