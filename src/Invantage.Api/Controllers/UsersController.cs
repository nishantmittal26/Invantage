using System;
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
    public class UsersController : BaseApiController
    {
        private readonly IUserService _userService;

        public class ToggleUserStatusRequest
        {
            public Guid Id { get; set; }
        }

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [HasPermission("Users:View")]
        public async Task<IActionResult> GetUsers()
        {
            var response = await _userService.GetUsersAsync();
            return Ok(response);
        }

        [HttpGet("{id}")]
        [HasPermission("Users:View")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var response = await _userService.GetUserByIdAsync(id);
            if (!response.Succeeded)
            {
                return NotFound(response);
            }
            return Ok(response);
        }

        [HttpPost]
        [HasPermission("Users:Add")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            var response = await _userService.CreateUserAsync(request);
            if (!response.Succeeded)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPut]
        [HasPermission("Users:Edit")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest request)
        {
            var response = await _userService.UpdateUserAsync(request);
            if (!response.Succeeded)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpDelete("{id}")]
        [HasPermission("Users:Delete")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var response = await _userService.DeleteUserAsync(id);
            if (!response.Succeeded)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPost("toggle-status")]
        [HasPermission("Users:Edit")]
        public async Task<IActionResult> ToggleStatus([FromBody] ToggleUserStatusRequest request)
        {
            var response = await _userService.ToggleUserStatusAsync(request.Id);
            if (!response.Succeeded)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
    }
}
