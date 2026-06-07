using System;

namespace Invantage.Core.Entities
{
    public class StockOutDetail
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid StockOutHeaderId { get; set; }
        public virtual StockOutHeader StockOutHeader { get; set; } = null!;

        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;

        public int Quantity { get; set; }
    }
}
