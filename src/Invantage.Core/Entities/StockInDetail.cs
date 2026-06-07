using System;

namespace Invantage.Core.Entities
{
    public class StockInDetail
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid StockInHeaderId { get; set; }
        public virtual StockInHeader StockInHeader { get; set; } = null!;

        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;

        public int Quantity { get; set; }
        public decimal CostPrice { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }
}
