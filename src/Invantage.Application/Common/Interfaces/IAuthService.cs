using System.Threading.Tasks;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Auth;

namespace Invantage.Application.Common.Interfaces
{
    public interface IAuthService
    {
        Task<GenericResponse<TokenResponse>> LoginAsync(LoginRequest request, string ipAddress);
        Task<GenericResponse<TokenResponse>> RefreshTokenAsync(string token, string refreshToken, string ipAddress);
        Task<GenericResponse<bool>> RevokeTokenAsync(string refreshToken, string ipAddress);
        Task<GenericResponse<bool>> ForgotPasswordAsync(ForgotPasswordRequest request);
        Task<GenericResponse<bool>> ResetPasswordAsync(ResetPasswordRequest request);
        Task<GenericResponse<bool>> ChangePasswordAsync(ChangePasswordRequest request);
    }
}
