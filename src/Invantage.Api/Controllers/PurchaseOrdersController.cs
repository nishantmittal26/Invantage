using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Invantage.Api.Security;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.DTOs.Purchase;

namespace Invantage.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrdersController : BaseApiController
    {
        private readonly IPurchaseOrderService _purchaseOrderService;

        public class PurchaseOrderActionRequest
        {
            public Guid Id { get; set; }
        }

        public PurchaseOrdersController(IPurchaseOrderService purchaseOrderService)
        {
            _purchaseOrderService = purchaseOrderService;
        }

        [HttpGet]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetPurchaseOrders()
        {
            var response = await _purchaseOrderService.GetPurchaseOrdersAsync();
            return Ok(response);
        }

        [HttpGet("{id}")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetPurchaseOrderById(Guid id)
        {
            var response = await _purchaseOrderService.GetPurchaseOrderByIdAsync(id);
            if (!response.Succeeded) return NotFound(response);
            return Ok(response);
        }

        [HttpPost]
        [HasPermission("Inventory:Add")]
        public async Task<IActionResult> CreatePurchaseOrder([FromBody] PurchaseOrderCreateDto request)
        {
            var response = await _purchaseOrderService.CreatePurchaseOrderAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("{id}/approve")]
        [HasPermission("Inventory:Edit")]
        public async Task<IActionResult> ApprovePurchaseOrder(Guid id)
        {
            var response = await _purchaseOrderService.ApprovePurchaseOrderAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("{id}/receive")]
        [HasPermission("Inventory:Edit")]
        public async Task<IActionResult> ReceivePurchaseOrder(Guid id)
        {
            var response = await _purchaseOrderService.ReceivePurchaseOrderAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("{id}/reject")]
        [HasPermission("Inventory:Edit")]
        public async Task<IActionResult> RejectPurchaseOrder(Guid id)
        {
            var response = await _purchaseOrderService.RejectPurchaseOrderAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }
    }
}
