using System;
using System.Collections.Generic;
using Invantage.Core.Enums;

namespace Invantage.Core.Entities
{
    public class PurchaseOrder : BaseEntity
    {
        public string PONumber { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public Guid SupplierId { get; set; }
        public virtual Supplier Supplier { get; set; } = null!;

        public Guid WarehouseId { get; set; } // Destination Warehouse for PO receiving
        public virtual Warehouse Warehouse { get; set; } = null!;

        public TransactionStatus Status { get; set; } = TransactionStatus.Draft;
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }

        public virtual ICollection<PurchaseOrderDetail> Details { get; set; } = new List<PurchaseOrderDetail>();
    }
}
