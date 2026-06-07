using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Invantage.Core.Entities.Identity
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Status { get; set; } = "Active"; // Active, Inactive
        public string Mobile { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
