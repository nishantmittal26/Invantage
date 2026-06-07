using System.Collections.Generic;
using System.Security.Claims;
using Invantage.Core.Entities.Identity;

namespace Invantage.Application.Common.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(ApplicationUser user, IList<string> roles, IEnumerable<Claim> customClaims);
        RefreshToken GenerateRefreshToken(string ipAddress);
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
