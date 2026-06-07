using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Invantage.Core.Entities.Identity
{
    public class ApplicationRole : IdentityRole<Guid>
    {
        public string Description { get; set; } = string.Empty;
        
        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
