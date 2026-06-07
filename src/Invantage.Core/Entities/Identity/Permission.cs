using System;

namespace Invantage.Core.Entities.Identity
{
    public class Permission : BaseEntity
    {
        public string Name { get; set; } = string.Empty; // e.g. "Products" or "Users"
        public string Module { get; set; } = string.Empty; // e.g. "Products", "Inventory", "Users", "Dashboard"
    }
}
