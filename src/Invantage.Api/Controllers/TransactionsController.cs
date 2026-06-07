using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Invantage.Api.Security;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.DTOs.Transactions;

namespace Invantage.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : BaseApiController
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        #region Stock In
        [HttpGet("stockin")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetStockIns()
        {
            var response = await _transactionService.GetStockInsAsync();
            return Ok(response);
        }

        [HttpGet("stockin/{id}")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetStockInById(Guid id)
        {
            var response = await _transactionService.GetStockInByIdAsync(id);
            if (!response.Succeeded) return NotFound(response);
            return Ok(response);
        }

        [HttpPost("stockin")]
        [HasPermission("Inventory:Add")]
        public async Task<IActionResult> CreateStockIn([FromBody] StockInCreateDto request)
        {
            var response = await _transactionService.CreateStockInAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("stockin/{id}/approve")]
        [HasPermission("Inventory:Edit")]
        public async Task<IActionResult> ApproveStockIn(Guid id)
        {
            var response = await _transactionService.ApproveStockInAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }
        #endregion

        #region Stock Out
        [HttpGet("stockout")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetStockOuts()
        {
            var response = await _transactionService.GetStockOutsAsync();
            return Ok(response);
        }

        [HttpGet("stockout/{id}")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetStockOutById(Guid id)
        {
            var response = await _transactionService.GetStockOutByIdAsync(id);
            if (!response.Succeeded) return NotFound(response);
            return Ok(response);
        }

        [HttpPost("stockout")]
        [HasPermission("Inventory:Add")]
        public async Task<IActionResult> CreateStockOut([FromBody] StockOutCreateDto request)
        {
            var response = await _transactionService.CreateStockOutAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("stockout/{id}/approve")]
        [HasPermission("Inventory:Edit")]
        public async Task<IActionResult> ApproveStockOut(Guid id)
        {
            var response = await _transactionService.ApproveStockOutAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }
        #endregion

        #region Adjustments
        [HttpGet("adjustments")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetAdjustments()
        {
            var response = await _transactionService.GetAdjustmentsAsync();
            return Ok(response);
        }

        [HttpGet("adjustments/{id}")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetAdjustmentById(Guid id)
        {
            var response = await _transactionService.GetAdjustmentByIdAsync(id);
            if (!response.Succeeded) return NotFound(response);
            return Ok(response);
        }

        [HttpPost("adjustments")]
        [HasPermission("Inventory:Add")]
        public async Task<IActionResult> CreateAdjustment([FromBody] AdjustmentCreateDto request)
        {
            var response = await _transactionService.CreateAdjustmentAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }
        #endregion

        #region Transfers
        [HttpGet("transfers")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetTransfers()
        {
            var response = await _transactionService.GetTransfersAsync();
            return Ok(response);
        }

        [HttpGet("transfers/{id}")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetTransferById(Guid id)
        {
            var response = await _transactionService.GetTransferByIdAsync(id);
            if (!response.Succeeded) return NotFound(response);
            return Ok(response);
        }

        [HttpPost("transfers")]
        [HasPermission("Inventory:Add")]
        public async Task<IActionResult> CreateTransfer([FromBody] TransferCreateDto request)
        {
            var response = await _transactionService.CreateTransferAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("transfers/{id}/approve")]
        [HasPermission("Inventory:Edit")]
        public async Task<IActionResult> ApproveTransfer(Guid id)
        {
            var response = await _transactionService.ApproveTransferAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("transfers/{id}/reject")]
        [HasPermission("Inventory:Edit")]
        public async Task<IActionResult> RejectTransfer(Guid id)
        {
            var response = await _transactionService.RejectTransferAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }
        #endregion
    }
}
