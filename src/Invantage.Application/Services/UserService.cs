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
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IMapper _mapper;
        private readonly IApplicationDbContext _context;
        private readonly ISettingsService _auditLog;

        public UserService(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IMapper mapper,
            IApplicationDbContext context,
            ISettingsService auditLog)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _mapper = mapper;
            _context = context;
            _auditLog = auditLog;
        }

        public async Task<GenericResponse<List<UserDto>>> GetUsersAsync()
        {
            var users = await _context.Users.ToListAsync();
            var dtos = new List<UserDto>();

            foreach (var user in users)
            {
                var dto = _mapper.Map<UserDto>(user);
                var roles = await _userManager.GetRolesAsync(user);
                dto.Role = roles.FirstOrDefault() ?? "StoreUser";
                dtos.Add(dto);
            }

            return GenericResponse<List<UserDto>>.Success(dtos);
        }

        public async Task<GenericResponse<UserDto>> GetUserByIdAsync(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return GenericResponse<UserDto>.Failure("User not found.");
            }

            var dto = _mapper.Map<UserDto>(user);
            var roles = await _userManager.GetRolesAsync(user);
            dto.Role = roles.FirstOrDefault() ?? "StoreUser";

            return GenericResponse<UserDto>.Success(dto);
        }

        public async Task<GenericResponse<UserDto>> CreateUserAsync(CreateUserRequest request)
        {
            var existingEmail = await _userManager.FindByEmailAsync(request.Email);
            if (existingEmail != null)
            {
                return GenericResponse<UserDto>.Failure("Email is already registered.");
            }

            var existingUsername = await _userManager.FindByNameAsync(request.UserName);
            if (existingUsername != null)
            {
                return GenericResponse<UserDto>.Failure("Username is already taken.");
            }

            // Verify Role exists
            var roleExists = await _roleManager.RoleExistsAsync(request.Role);
            if (!roleExists)
            {
                return GenericResponse<UserDto>.Failure($"Selected role '{request.Role}' does not exist.");
            }

            var user = new ApplicationUser
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                UserName = request.UserName,
                Mobile = request.Mobile,
                PhoneNumber = request.Mobile,
                Status = request.Status
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return GenericResponse<UserDto>.Failure("Failed to create user.", errors);
            }

            // Add role
            await _userManager.AddToRoleAsync(user, request.Role);

            await _auditLog.CreateAuditLogAsync("Add", "Users", $"Created user {user.UserName} with role {request.Role}");

            var dto = _mapper.Map<UserDto>(user);
            dto.Role = request.Role;

            return GenericResponse<UserDto>.Success(dto, "User created successfully.");
        }

        public async Task<GenericResponse<UserDto>> UpdateUserAsync(UpdateUserRequest request)
        {
            var user = await _userManager.FindByIdAsync(request.Id.ToString());
            if (user == null)
            {
                return GenericResponse<UserDto>.Failure("User not found.");
            }

            // Verify unique email if changed
            if (!string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase))
            {
                var existingEmail = await _userManager.FindByEmailAsync(request.Email);
                if (existingEmail != null)
                {
                    return GenericResponse<UserDto>.Failure("Email is already in use by another account.");
                }
                user.Email = request.Email;
                user.NormalizedEmail = request.Email.ToUpper();
            }

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Mobile = request.Mobile;
            user.PhoneNumber = request.Mobile;
            user.Status = request.Status;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return GenericResponse<UserDto>.Failure("Failed to update user details.", errors);
            }

            // Update Password if provided
            if (!string.IsNullOrEmpty(request.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var resetResult = await _userManager.ResetPasswordAsync(user, token, request.Password);
                if (!resetResult.Succeeded)
                {
                    var errors = resetResult.Errors.Select(e => e.Description).ToList();
                    return GenericResponse<UserDto>.Failure("Failed to reset user password, details were updated.", errors);
                }
            }

            // Update Role
            var currentRoles = await _userManager.GetRolesAsync(user);
            if (!currentRoles.Contains(request.Role))
            {
                // Verify new role exists
                var roleExists = await _roleManager.RoleExistsAsync(request.Role);
                if (roleExists)
                {
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);
                    await _userManager.AddToRoleAsync(user, request.Role);
                }
            }

            await _auditLog.CreateAuditLogAsync("Edit", "Users", $"Updated user {user.UserName}");

            var dto = _mapper.Map<UserDto>(user);
            dto.Role = request.Role;

            return GenericResponse<UserDto>.Success(dto, "User updated successfully.");
        }

        public async Task<GenericResponse<bool>> DeleteUserAsync(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return GenericResponse<bool>.Failure("User not found.");
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return GenericResponse<bool>.Failure("Failed to delete user.", errors);
            }

            await _auditLog.CreateAuditLogAsync("Delete", "Users", $"Deleted user {user.UserName}");

            return GenericResponse<bool>.Success(true, "User deleted successfully.");
        }

        public async Task<GenericResponse<bool>> ToggleUserStatusAsync(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return GenericResponse<bool>.Failure("User not found.");
            }

            user.Status = (user.Status == "Active") ? "Inactive" : "Active";
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return GenericResponse<bool>.Failure("Failed to update user status.");
            }

            await _auditLog.CreateAuditLogAsync("Edit", "Users", $"Toggled status of user {user.UserName} to {user.Status}");

            return GenericResponse<bool>.Success(true, $"User status changed to {user.Status}.");
        }
    }
}
