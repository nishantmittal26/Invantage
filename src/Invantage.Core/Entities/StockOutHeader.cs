using System;
using System.Collections.Generic;
using Invantage.Core.Enums;

namespace Invantage.Core.Entities
{
    public class StockOutHeader : BaseEntity
    {
        public string TransactionNo { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public Guid WarehouseId { get; set; }
        public virtual Warehouse Warehouse { get; set; } = null!;

        public string DepartmentOrUser { get; set; } = string.Empty;

        public TransactionStatus Status { get; set; } = TransactionStatus.Draft;
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }

        public virtual ICollection<StockOutDetail> Details { get; set; } = new List<StockOutDetail>();
    }
}
