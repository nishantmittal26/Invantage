using System;
using Invantage.Core.Enums;

namespace Invantage.Core.Entities
{
    public class InventoryAdjustment : BaseEntity
    {
        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;

        public Guid WarehouseId { get; set; }
        public virtual Warehouse Warehouse { get; set; } = null!;

        public int CurrentStock { get; set; }
        public int AdjustQuantity { get; set; }
        public AdjustmentReason Reason { get; set; }
        public string Remarks { get; set; } = string.Empty;
    }
}
