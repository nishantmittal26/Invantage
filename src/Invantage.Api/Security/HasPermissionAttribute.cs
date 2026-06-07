using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Invantage.Api.Security
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class HasPermissionAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string _permission;

        public HasPermissionAttribute(string permission)
        {
            _permission = permission;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (user == null || user.Identity == null || !user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // MasterAdmin bypasses all authorization checks
            if (user.IsInRole("MasterAdmin"))
            {
                await Task.CompletedTask;
                return;
            }

            // Check if user possesses required permission claim
            var hasClaim = user.Claims.Any(c => 
                c.Type == "permission" && 
                string.Equals(c.Value, _permission, StringComparison.OrdinalIgnoreCase));

            if (!hasClaim)
            {
                context.Result = new ObjectResult(new { succeeded = false, message = "Access Denied: You do not have permission to perform this action." })
                {
                    StatusCode = 403
                };
            }

            await Task.CompletedTask;
        }
    }
}
