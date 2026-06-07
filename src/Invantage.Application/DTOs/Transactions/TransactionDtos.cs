using System;
using System.Collections.Generic;
using Invantage.Core.Enums;

namespace Invantage.Application.DTOs.Transactions
{
    // Stock In DTOs
    public class StockInHeaderDto
    {
        public Guid Id { get; set; }
        public string TransactionNo { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public Guid SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public Guid WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Draft, Approved, etc.
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public List<StockInDetailDto> Details { get; set; } = new List<StockInDetailDto>();
    }

    public class StockInDetailDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal CostPrice { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class StockInCreateDto
    {
        public Guid SupplierId { get; set; }
        public Guid WarehouseId { get; set; }
        public List<StockInDetailCreateDto> Details { get; set; } = new List<StockInDetailCreateDto>();
    }

    public class StockInDetailCreateDto
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal CostPrice { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    // Stock Out DTOs
    public class StockOutHeaderDto
    {
        public Guid Id { get; set; }
        public string TransactionNo { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public Guid WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string DepartmentOrUser { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public List<StockOutDetailDto> Details { get; set; } = new List<StockOutDetailDto>();
    }

    public class StockOutDetailDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }

    public class StockOutCreateDto
    {
        public Guid WarehouseId { get; set; }
        public string DepartmentOrUser { get; set; } = string.Empty;
        public List<StockOutDetailCreateDto> Details { get; set; } = new List<StockOutDetailCreateDto>();
    }

    public class StockOutDetailCreateDto
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }

    // Inventory Adjustment DTOs
    public class AdjustmentDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public Guid WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public int AdjustQuantity { get; set; }
        public string Reason { get; set; } = string.Empty; // Damage, Lost, Found, ManualCorrection
        public string Remarks { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class AdjustmentCreateDto
    {
        public Guid ProductId { get; set; }
        public Guid WarehouseId { get; set; }
        public int AdjustQuantity { get; set; }
        public AdjustmentReason Reason { get; set; }
        public string Remarks { get; set; } = string.Empty;
    }

    // Inventory Transfer DTOs
    public class TransferHeaderDto
    {
        public Guid Id { get; set; }
        public string TransactionNo { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public Guid SourceWarehouseId { get; set; }
        public string SourceWarehouseName { get; set; } = string.Empty;
        public Guid DestinationWarehouseId { get; set; }
        public string DestinationWarehouseName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public List<TransferDetailDto> Details { get; set; } = new List<TransferDetailDto>();
    }

    public class TransferDetailDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }

    public class TransferCreateDto
    {
        public Guid SourceWarehouseId { get; set; }
        public Guid DestinationWarehouseId { get; set; }
        public List<TransferDetailCreateDto> Details { get; set; } = new List<TransferDetailCreateDto>();
    }

    public class TransferDetailCreateDto
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
