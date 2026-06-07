using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Invantage.Application.Common.Interfaces;
using System.IdentityModel.Tokens.Jwt;

namespace Invantage.Api.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? UserId => 
            _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ??
            _httpContextAccessor.HttpContext?.User?.FindFirstValue(JwtRegisteredClaimNames.Sub);

        public string? Username => 
            _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name) ??
            _httpContextAccessor.HttpContext?.User?.FindFirstValue(JwtRegisteredClaimNames.UniqueName) ??
            _httpContextAccessor.HttpContext?.User?.Identity?.Name;

        public string? IpAddress => 
            _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
    }
}
