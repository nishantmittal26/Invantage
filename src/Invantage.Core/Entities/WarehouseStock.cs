using System;

namespace Invantage.Core.Entities
{
    public class WarehouseStock
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid WarehouseId { get; set; }
        public virtual Warehouse Warehouse { get; set; } = null!;

        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;

        public int CurrentStock { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
