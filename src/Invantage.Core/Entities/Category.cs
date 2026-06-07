using System;
using System.Collections.Generic;

namespace Invantage.Core.Entities
{
    public class Category : BaseEntity
    {
        public string CategoryName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
