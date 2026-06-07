using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Reports;

namespace Invantage.Application.Common.Interfaces
{
    public interface IReportService
    {
        Task<GenericResponse<DashboardSummaryDto>> GetDashboardSummaryAsync();
        Task<GenericResponse<List<StockReportDto>>> GetCurrentStockReportAsync(Guid? categoryId, Guid? warehouseId);
        Task<GenericResponse<List<StockMovementReportDto>>> GetStockMovementReportAsync(DateTime startDate, DateTime endDate);
        Task<GenericResponse<List<StockReportDto>>> GetInventoryValuationReportAsync();
        Task<GenericResponse<List<SupplierWisePurchaseReportDto>>> GetSupplierWisePurchaseReportAsync();
        Task<GenericResponse<List<ProductWiseMovementReportDto>>> GetProductWiseMovementReportAsync(Guid productId);
    }
}
