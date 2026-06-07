using System;

namespace Invantage.Core.Entities
{
    public class PurchaseOrderDetail
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid PurchaseOrderId { get; set; }
        public virtual PurchaseOrder PurchaseOrder { get; set; } = null!;

        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;

        public int Quantity { get; set; }
        public decimal Rate { get; set; }
    }
}
