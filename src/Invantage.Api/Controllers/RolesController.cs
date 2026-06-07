using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Invantage.Api.Security;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.DTOs.Security;

namespace Invantage.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : BaseApiController
    {
        private readonly IRoleService _roleService;

        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        [HasPermission("Users:View")]
        public async Task<IActionResult> GetRoles()
        {
            var response = await _roleService.GetRolesAsync();
            return Ok(response);
        }

        [HttpGet("{id}")]
        [HasPermission("Users:View")]
        public async Task<IActionResult> GetRoleById(Guid id)
        {
            var response = await _roleService.GetRoleByIdAsync(id);
            if (!response.Succeeded)
            {
                return NotFound(response);
            }
            return Ok(response);
        }

        [HttpPost]
        [HasPermission("Users:Add")]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            var response = await _roleService.CreateRoleAsync(request);
            if (!response.Succeeded)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPut]
        [HasPermission("Users:Edit")]
        public async Task<IActionResult> UpdateRole([FromBody] UpdateRoleRequest request)
        {
            var response = await _roleService.UpdateRoleAsync(request);
            if (!response.Succeeded)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpDelete("{id}")]
        [HasPermission("Users:Delete")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            var response = await _roleService.DeleteRoleAsync(id);
            if (!response.Succeeded)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpGet("permissions")]
        [HasPermission("Users:View")]
        public async Task<IActionResult> GetPermissions()
        {
            var response = await _roleService.GetPermissionsAsync();
            return Ok(response);
        }

        [HttpGet("{roleId}/permissions")]
        [HasPermission("Users:View")]
        public async Task<IActionResult> GetRolePermissions(Guid roleId)
        {
            var response = await _roleService.GetRolePermissionsAsync(roleId);
            return Ok(response);
        }

        [HttpPut("{roleId}/permissions")]
        [HasPermission("Users:Edit")]
        public async Task<IActionResult> UpdateRolePermissions(Guid roleId, [FromBody] List<RolePermissionDto> permissions)
        {
            var response = await _roleService.UpdateRolePermissionsAsync(roleId, permissions);
            if (!response.Succeeded)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
    }
}
