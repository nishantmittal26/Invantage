using System;
using System.Collections.Generic;

namespace Invantage.Application.DTOs.Reports
{
    public class DashboardSummaryDto
    {
        // Summary Widgets
        public int TotalProducts { get; set; }
        public int TotalCategories { get; set; }
        public int TotalSuppliers { get; set; }
        public int TotalWarehouses { get; set; }

        // Stock Status Widgets
        public int InStockCount { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }

        // Today's Transactions Widgets
        public int TodayStockInQty { get; set; }
        public int TodayStockOutQty { get; set; }

        // Alert Lists
        public List<LowStockAlertDto> LowStockAlerts { get; set; } = new List<LowStockAlertDto>();
        public List<ExpiryAlertDto> ExpiryAlerts { get; set; } = new List<ExpiryAlertDto>();

        // Chart Data
        public List<MonthlyTransactionChartDto> MonthlyTransactions { get; set; } = new List<MonthlyTransactionChartDto>();
        public List<ValuationTrendChartDto> ValuationTrends { get; set; } = new List<ValuationTrendChartDto>();
    }

    public class LowStockAlertDto
    {
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public int ReorderLevel { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
    }

    public class ExpiryAlertDto
    {
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string BatchNumber { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public int DaysRemaining { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
    }

    public class MonthlyTransactionChartDto
    {
        public string Month { get; set; } = string.Empty; // e.g. "Jan", "Feb"
        public int StockIn { get; set; }
        public int StockOut { get; set; }
    }

    public class ValuationTrendChartDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal TotalValue { get; set; }
    }

    // Report Results
    public class StockReportDto
    {
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string UnitName { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SellingPrice { get; set; }
        public decimal TotalCostValue => CurrentStock * CostPrice;
        public decimal TotalSellingValue => CurrentStock * SellingPrice;
    }

    public class StockMovementReportDto
    {
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public int OpeningStock { get; set; }
        public int StockInQuantity { get; set; }
        public int StockOutQuantity { get; set; }
        public int AdjustmentQuantity { get; set; }
        public int ClosingStock { get; set; }
    }

    public class SupplierWisePurchaseReportDto
    {
        public Guid SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public int TotalOrdersCount { get; set; }
        public decimal TotalPurchaseAmount { get; set; }
        public int TotalItemsPurchased { get; set; }
    }

    public class ProductWiseMovementReportDto
    {
        public DateTime Date { get; set; }
        public string TransactionType { get; set; } = string.Empty; // Stock In, Stock Out, Adjustment, Transfer
        public string TransactionNo { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string PerformedBy { get; set; } = string.Empty;
    }
}
