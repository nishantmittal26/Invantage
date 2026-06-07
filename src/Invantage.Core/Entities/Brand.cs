using System;
using System.Collections.Generic;

namespace Invantage.Core.Entities
{
    public class Brand : BaseEntity
    {
        public string BrandName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
