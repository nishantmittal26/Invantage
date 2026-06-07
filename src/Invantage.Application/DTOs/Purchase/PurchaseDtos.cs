using System;
using System.Collections.Generic;

namespace Invantage.Application.DTOs.Purchase
{
    public class PurchaseOrderDto
    {
        public Guid Id { get; set; }
        public string PONumber { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public Guid SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public Guid WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Draft, Approved, Received, Rejected
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public List<PurchaseOrderDetailDto> Details { get; set; } = new List<PurchaseOrderDetailDto>();
    }

    public class PurchaseOrderDetailDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
    }

    public class PurchaseOrderCreateDto
    {
        public Guid SupplierId { get; set; }
        public Guid WarehouseId { get; set; }
        public List<PurchaseOrderDetailCreateDto> Details { get; set; } = new List<PurchaseOrderDetailCreateDto>();
    }

    public class PurchaseOrderDetailCreateDto
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
    }
}
