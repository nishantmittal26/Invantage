using System;
using System.Collections.Generic;

namespace Invantage.Core.Entities
{
    public class Product : BaseEntity
    {
        public string ProductCode { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public Guid CategoryId { get; set; }
        public virtual Category Category { get; set; } = null!;

        public Guid BrandId { get; set; }
        public virtual Brand Brand { get; set; } = null!;

        public Guid UnitId { get; set; }
        public virtual Unit Unit { get; set; } = null!;

        public int ReorderLevel { get; set; }
        public int MinimumStock { get; set; }
        public int MaximumStock { get; set; }

        public decimal CostPrice { get; set; }
        public decimal SellingPrice { get; set; }

        public string Barcode { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }

        public virtual ICollection<WarehouseStock> WarehouseStocks { get; set; } = new List<WarehouseStock>();
    }
}
