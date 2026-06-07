using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Invantage.Api.Security;
using Invantage.Application.Common.Interfaces;

namespace Invantage.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : BaseApiController
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("dashboard")]
        [HasPermission("Dashboard:View")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var response = await _reportService.GetDashboardSummaryAsync();
            return Ok(response);
        }

        [HttpGet("stock")]
        [HasPermission("Reports:View")]
        public async Task<IActionResult> GetStockReport([FromQuery] Guid? categoryId, [FromQuery] Guid? warehouseId)
        {
            var response = await _reportService.GetCurrentStockReportAsync(categoryId, warehouseId);
            return Ok(response);
        }

        [HttpGet("movement")]
        [HasPermission("Reports:View")]
        public async Task<IActionResult> GetStockMovementReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
            var end = endDate ?? DateTime.UtcNow;
            var response = await _reportService.GetStockMovementReportAsync(start, end);
            return Ok(response);
        }

        [HttpGet("valuation")]
        [HasPermission("Reports:View")]
        public async Task<IActionResult> GetInventoryValuationReport()
        {
            var response = await _reportService.GetInventoryValuationReportAsync();
            return Ok(response);
        }

        [HttpGet("supplier-purchases")]
        [HasPermission("Reports:View")]
        public async Task<IActionResult> GetSupplierPurchasesReport()
        {
            var response = await _reportService.GetSupplierWisePurchaseReportAsync();
            return Ok(response);
        }

        [HttpGet("product-movements/{productId}")]
        [HasPermission("Reports:View")]
        public async Task<IActionResult> GetProductMovementsReport(Guid productId)
        {
            var response = await _reportService.GetProductWiseMovementReportAsync(productId);
            return Ok(response);
        }
    }
}
