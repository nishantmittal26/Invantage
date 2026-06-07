using System;

namespace Invantage.Application.DTOs.Masters
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class CategoryUpsertDto
    {
        public Guid? Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class BrandDto
    {
        public Guid Id { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class BrandUpsertDto
    {
        public Guid? Id { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UnitDto
    {
        public Guid Id { get; set; }
        public string UnitName { get; set; } = string.Empty;
    }

    public class UnitUpsertDto
    {
        public Guid? Id { get; set; }
        public string UnitName { get; set; } = string.Empty;
    }

    public class SupplierDto
    {
        public Guid Id { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string GSTNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }

    public class SupplierUpsertDto
    {
        public Guid? Id { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string GSTNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }

    public class WarehouseDto
    {
        public Guid Id { get; set; }
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Manager { get; set; } = string.Empty;
    }

    public class WarehouseUpsertDto
    {
        public Guid? Id { get; set; }
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Manager { get; set; } = string.Empty;
    }

    public class ProductDto
    {
        public Guid Id { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;

        public Guid BrandId { get; set; }
        public string BrandName { get; set; } = string.Empty;

        public Guid UnitId { get; set; }
        public string UnitName { get; set; } = string.Empty;

        public int ReorderLevel { get; set; }
        public int MinimumStock { get; set; }
        public int MaximumStock { get; set; }

        public decimal CostPrice { get; set; }
        public decimal SellingPrice { get; set; }

        public string Barcode { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int TotalStock { get; set; } // Aggregate stock across all warehouses
    }

    public class ProductUpsertDto
    {
        public Guid? Id { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public Guid CategoryId { get; set; }
        public Guid BrandId { get; set; }
        public Guid UnitId { get; set; }

        public int ReorderLevel { get; set; }
        public int MinimumStock { get; set; }
        public int MaximumStock { get; set; }

        public decimal CostPrice { get; set; }
        public decimal SellingPrice { get; set; }

        public string Barcode { get; set; } = string.Empty;
        public string? ImageBase64 { get; set; } // Used to receive uploaded images as base64
        public string? ImageUrl { get; set; }
    }

    public class WarehouseStockDto
    {
        public Guid Id { get; set; }
        public Guid WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
