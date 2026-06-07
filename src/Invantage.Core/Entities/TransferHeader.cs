using System;
using System.Collections.Generic;
using Invantage.Core.Enums;

namespace Invantage.Core.Entities
{
    public class TransferHeader : BaseEntity
    {
        public string TransactionNo { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public Guid SourceWarehouseId { get; set; }
        public virtual Warehouse SourceWarehouse { get; set; } = null!;

        public Guid DestinationWarehouseId { get; set; }
        public virtual Warehouse DestinationWarehouse { get; set; } = null!;

        public TransactionStatus Status { get; set; } = TransactionStatus.Draft;
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }

        public virtual ICollection<TransferDetail> Details { get; set; } = new List<TransferDetail>();
    }
}
