using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Auth;
using Invantage.Core.Entities.Identity;

namespace Invantage.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ITokenService _tokenService;
        private readonly IApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ICurrentUserService _currentUserService;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            ITokenService tokenService,
            IApplicationDbContext context,
            IEmailService emailService,
            ICurrentUserService currentUserService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _tokenService = tokenService;
            _context = context;
            _emailService = emailService;
            _currentUserService = currentUserService;
        }

        public async Task<GenericResponse<TokenResponse>> LoginAsync(LoginRequest request, string ipAddress)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return GenericResponse<TokenResponse>.Failure("Invalid email or password.");
            }

            if (user.Status != "Active")
            {
                return GenericResponse<TokenResponse>.Failure("Your account has been deactivated. Please contact the administrator.");
            }

            var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
            {
                return GenericResponse<TokenResponse>.Failure("Invalid email or password.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var roleName = roles.FirstOrDefault() ?? "StoreUser";

            var role = await _roleManager.FindByNameAsync(roleName);
            var customClaims = new List<Claim>();

            if (role != null)
            {
                var rolePermissions = await _context.RolePermissions
                    .Include(rp => rp.Permission)
                    .Where(rp => rp.RoleId == role.Id)
                    .ToListAsync();

                foreach (var rp in rolePermissions)
                {
                    if (rp.View) customClaims.Add(new Claim("permission", $"{rp.Permission.Name}:View"));
                    if (rp.Add) customClaims.Add(new Claim("permission", $"{rp.Permission.Name}:Add"));
                    if (rp.Edit) customClaims.Add(new Claim("permission", $"{rp.Permission.Name}:Edit"));
                    if (rp.Delete) customClaims.Add(new Claim("permission", $"{rp.Permission.Name}:Delete"));
                }
            }

            var accessToken = _tokenService.GenerateAccessToken(user, roles, customClaims);
            var refreshToken = _tokenService.GenerateRefreshToken(ipAddress);

            // Save Refresh Token
            user.RefreshTokens.Add(refreshToken);
            await _userManager.UpdateAsync(user);

            var response = new TokenResponse
            {
                Token = accessToken,
                RefreshToken = refreshToken.Token,
                RefreshTokenExpiration = refreshToken.Expires,
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Role = roleName,
                FirstName = user.FirstName,
                LastName = user.LastName
            };

            return GenericResponse<TokenResponse>.Success(response, "Login successful.");
        }

        public async Task<GenericResponse<TokenResponse>> RefreshTokenAsync(string token, string refreshToken, string ipAddress)
        {
            ClaimsPrincipal? principal;
            try
            {
                principal = _tokenService.GetPrincipalFromExpiredToken(token);
            }
            catch (Exception)
            {
                return GenericResponse<TokenResponse>.Failure("Invalid token.");
            }

            if (principal == null)
            {
                return GenericResponse<TokenResponse>.Failure("Invalid token principal.");
            }

            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier) ?? principal.FindFirst("sub");
            if (userIdClaim == null)
            {
                return GenericResponse<TokenResponse>.Failure("Invalid token claims.");
            }

            var userId = Guid.Parse(userIdClaim.Value);
            var user = await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return GenericResponse<TokenResponse>.Failure("User not found.");
            }

            var existingToken = user.RefreshTokens.FirstOrDefault(x => x.Token == refreshToken);
            if (existingToken == null || !existingToken.IsActive)
            {
                return GenericResponse<TokenResponse>.Failure("Invalid or expired refresh token.");
            }

            // Revoke current refresh token and replace it
            var newRefreshToken = _tokenService.GenerateRefreshToken(ipAddress);
            existingToken.Revoked = DateTime.UtcNow;
            existingToken.RevokedByIp = ipAddress;
            existingToken.ReplacedByToken = newRefreshToken.Token;

            user.RefreshTokens.Add(newRefreshToken);
            await _userManager.UpdateAsync(user);

            var roles = await _userManager.GetRolesAsync(user);
            var roleName = roles.FirstOrDefault() ?? "StoreUser";

            var role = await _roleManager.FindByNameAsync(roleName);
            var customClaims = new List<Claim>();

            if (role != null)
            {
                var rolePermissions = await _context.RolePermissions
                    .Include(rp => rp.Permission)
                    .Where(rp => rp.RoleId == role.Id)
                    .ToListAsync();

                foreach (var rp in rolePermissions)
                {
                    if (rp.View) customClaims.Add(new Claim("permission", $"{rp.Permission.Name}:View"));
                    if (rp.Add) customClaims.Add(new Claim("permission", $"{rp.Permission.Name}:Add"));
                    if (rp.Edit) customClaims.Add(new Claim("permission", $"{rp.Permission.Name}:Edit"));
                    if (rp.Delete) customClaims.Add(new Claim("permission", $"{rp.Permission.Name}:Delete"));
                }
            }

            var newAccessToken = _tokenService.GenerateAccessToken(user, roles, customClaims);

            var response = new TokenResponse
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken.Token,
                RefreshTokenExpiration = newRefreshToken.Expires,
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Role = roleName,
                FirstName = user.FirstName,
                LastName = user.LastName
            };

            return GenericResponse<TokenResponse>.Success(response, "Token refreshed successfully.");
        }

        public async Task<GenericResponse<bool>> RevokeTokenAsync(string refreshToken, string ipAddress)
        {
            var user = await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == refreshToken));

            if (user == null)
            {
                return GenericResponse<bool>.Failure("Token not found.");
            }

            var token = user.RefreshTokens.Single(x => x.Token == refreshToken);
            if (!token.IsActive)
            {
                return GenericResponse<bool>.Failure("Token is already inactive.");
            }

            token.Revoked = DateTime.UtcNow;
            token.RevokedByIp = ipAddress;
            await _userManager.UpdateAsync(user);

            return GenericResponse<bool>.Success(true, "Token revoked successfully.");
        }

        public async Task<GenericResponse<bool>> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // Return success anyway to avoid user enumeration
                return GenericResponse<bool>.Success(true, "If your email is registered, a password reset link has been sent.");
            }

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            // Build reset link (mock client route)
            var resetLink = $"http://localhost:5173/reset-password?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(user.Email!)}";
            var subject = "Reset Password - Invantage Inventory Management";
            var body = $"<h3>Hi {user.FirstName},</h3><p>Please reset your password by clicking on the link below:</p><p><a href='{resetLink}'>Reset Password Link</a></p><br/><p>If you didn't request this, please ignore this email.</p>";

            await _emailService.SendEmailAsync(user.Email!, subject, body);

            return GenericResponse<bool>.Success(true, "If your email is registered, a password reset link has been sent.");
        }

        public async Task<GenericResponse<bool>> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return GenericResponse<bool>.Failure("User not found.");
            }

            var result = await _userManager.ResetPasswordAsync(user, request.Token, request.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return GenericResponse<bool>.Failure("Failed to reset password.", errors);
            }

            return GenericResponse<bool>.Success(true, "Password has been reset successfully.");
        }

        public async Task<GenericResponse<bool>> ChangePasswordAsync(ChangePasswordRequest request)
        {
            var userIdStr = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userIdStr))
            {
                return GenericResponse<bool>.Failure("Unauthorized access.");
            }

            var user = await _userManager.FindByIdAsync(userIdStr);
            if (user == null)
            {
                return GenericResponse<bool>.Failure("User not found.");
            }

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return GenericResponse<bool>.Failure("Failed to change password.", errors);
            }

            return GenericResponse<bool>.Success(true, "Password changed successfully.");
        }
    }
}
