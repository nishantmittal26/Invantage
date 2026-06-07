using System;
using System.Collections.Generic;

namespace Invantage.Core.Entities
{
    public class Warehouse : BaseEntity
    {
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Manager { get; set; } = string.Empty;

        public virtual ICollection<WarehouseStock> WarehouseStocks { get; set; } = new List<WarehouseStock>();
    }
}
