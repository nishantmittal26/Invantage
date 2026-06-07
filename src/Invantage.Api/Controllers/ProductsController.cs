using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Invantage.Api.Security;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.DTOs.Masters;

namespace Invantage.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : BaseApiController
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        [HasPermission("Products:View")]
        public async Task<IActionResult> GetProducts()
        {
            var response = await _productService.GetProductsAsync();
            return Ok(response);
        }

        [HttpGet("{id}")]
        [HasPermission("Products:View")]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            var response = await _productService.GetProductByIdAsync(id);
            if (!response.Succeeded)
            {
                return NotFound(response);
            }
            return Ok(response);
        }

        [HttpPost]
        [HasPermission("Products:Add")]
        public async Task<IActionResult> CreateProduct([FromBody] ProductUpsertDto request)
        {
            var response = await _productService.CreateProductAsync(request);
            if (!response.Succeeded)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPut]
        [HasPermission("Products:Edit")]
        public async Task<IActionResult> UpdateProduct([FromBody] ProductUpsertDto request)
        {
            var response = await _productService.UpdateProductAsync(request);
            if (!response.Succeeded)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpDelete("{id}")]
        [HasPermission("Products:Delete")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var response = await _productService.DeleteProductAsync(id);
            if (!response.Succeeded)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpGet("barcode/{barcode}")]
        [HasPermission("Products:View")]
        public async Task<IActionResult> GetProductByBarcode(string barcode)
        {
            var response = await _productService.GetProductByBarcodeAsync(barcode);
            if (!response.Succeeded)
            {
                return NotFound(response);
            }
            return Ok(response);
        }

        [HttpGet("{id}/stocks")]
        [HasPermission("Products:View")]
        public async Task<IActionResult> GetWarehouseStocks(Guid id)
        {
            var response = await _productService.GetWarehouseStocksAsync(id);
            return Ok(response);
        }

        [HttpGet("stocks")]
        [HasPermission("Products:View")]
        public async Task<IActionResult> GetAllWarehouseStocks()
        {
            var response = await _productService.GetAllWarehouseStocksAsync();
            return Ok(response);
        }
    }
}
