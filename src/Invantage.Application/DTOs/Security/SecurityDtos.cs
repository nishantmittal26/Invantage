using System;
using System.Collections.Generic;

namespace Invantage.Application.DTOs.Security
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = "Active"; // Active, Inactive
        public DateTime CreatedDate { get; set; }
    }

    public class CreateUserRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // Role Name
        public string Status { get; set; } = "Active";
    }

    public class UpdateUserRequest
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public string? Password { get; set; } // Optional password reset
    }

    public class RoleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<RolePermissionDto> Permissions { get; set; } = new List<RolePermissionDto>();
    }

    public class CreateRoleRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<RolePermissionDto> Permissions { get; set; } = new List<RolePermissionDto>();
    }

    public class UpdateRoleRequest
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<RolePermissionDto> Permissions { get; set; } = new List<RolePermissionDto>();
    }

    public class PermissionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
    }

    public class RolePermissionDto
    {
        public Guid PermissionId { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public bool View { get; set; }
        public bool Add { get; set; }
        public bool Edit { get; set; }
        public bool Delete { get; set; }
    }

    public class PermissionMatrixDto
    {
        public Guid RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public List<RolePermissionDto> RowPermissions { get; set; } = new List<RolePermissionDto>();
    }
}
