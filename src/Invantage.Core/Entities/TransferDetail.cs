using System;

namespace Invantage.Core.Entities
{
    public class TransferDetail
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid TransferHeaderId { get; set; }
        public virtual TransferHeader TransferHeader { get; set; } = null!;

        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;

        public int Quantity { get; set; }
    }
}
