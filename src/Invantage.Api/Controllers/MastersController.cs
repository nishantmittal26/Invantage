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
    public class MastersController : BaseApiController
    {
        private readonly IMasterServices _masterServices;

        public MastersController(IMasterServices masterServices)
        {
            _masterServices = masterServices;
        }

        #region Categories
        [HttpGet("categories")]
        [HasPermission("Products:View")]
        public async Task<IActionResult> GetCategories()
        {
            var response = await _masterServices.GetCategoriesAsync();
            return Ok(response);
        }

        [HttpGet("categories/{id}")]
        [HasPermission("Products:View")]
        public async Task<IActionResult> GetCategoryById(Guid id)
        {
            var response = await _masterServices.GetCategoryByIdAsync(id);
            if (!response.Succeeded) return NotFound(response);
            return Ok(response);
        }

        [HttpPost("categories")]
        [HasPermission("Products:Add")]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryUpsertDto request)
        {
            var response = await _masterServices.CreateCategoryAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPut("categories")]
        [HasPermission("Products:Edit")]
        public async Task<IActionResult> UpdateCategory([FromBody] CategoryUpsertDto request)
        {
            var response = await _masterServices.UpdateCategoryAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("categories/{id}")]
        [HasPermission("Products:Delete")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var response = await _masterServices.DeleteCategoryAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }
        #endregion

        #region Brands
        [HttpGet("brands")]
        [HasPermission("Products:View")]
        public async Task<IActionResult> GetBrands()
        {
            var response = await _masterServices.GetBrandsAsync();
            return Ok(response);
        }

        [HttpGet("brands/{id}")]
        [HasPermission("Products:View")]
        public async Task<IActionResult> GetBrandById(Guid id)
        {
            var response = await _masterServices.GetBrandByIdAsync(id);
            if (!response.Succeeded) return NotFound(response);
            return Ok(response);
        }

        [HttpPost("brands")]
        [HasPermission("Products:Add")]
        public async Task<IActionResult> CreateBrand([FromBody] BrandUpsertDto request)
        {
            var response = await _masterServices.CreateBrandAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPut("brands")]
        [HasPermission("Products:Edit")]
        public async Task<IActionResult> UpdateBrand([FromBody] BrandUpsertDto request)
        {
            var response = await _masterServices.UpdateBrandAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("brands/{id}")]
        [HasPermission("Products:Delete")]
        public async Task<IActionResult> DeleteBrand(Guid id)
        {
            var response = await _masterServices.DeleteBrandAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }
        #endregion

        #region Units
        [HttpGet("units")]
        [HasPermission("Products:View")]
        public async Task<IActionResult> GetUnits()
        {
            var response = await _masterServices.GetUnitsAsync();
            return Ok(response);
        }

        [HttpGet("units/{id}")]
        [HasPermission("Products:View")]
        public async Task<IActionResult> GetUnitById(Guid id)
        {
            var response = await _masterServices.GetUnitByIdAsync(id);
            if (!response.Succeeded) return NotFound(response);
            return Ok(response);
        }

        [HttpPost("units")]
        [HasPermission("Products:Add")]
        public async Task<IActionResult> CreateUnit([FromBody] UnitUpsertDto request)
        {
            var response = await _masterServices.CreateUnitAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPut("units")]
        [HasPermission("Products:Edit")]
        public async Task<IActionResult> UpdateUnit([FromBody] UnitUpsertDto request)
        {
            var response = await _masterServices.UpdateUnitAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("units/{id}")]
        [HasPermission("Products:Delete")]
        public async Task<IActionResult> DeleteUnit(Guid id)
        {
            var response = await _masterServices.DeleteUnitAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }
        #endregion

        #region Suppliers
        [HttpGet("suppliers")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetSuppliers()
        {
            var response = await _masterServices.GetSuppliersAsync();
            return Ok(response);
        }

        [HttpGet("suppliers/{id}")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetSupplierById(Guid id)
        {
            var response = await _masterServices.GetSupplierByIdAsync(id);
            if (!response.Succeeded) return NotFound(response);
            return Ok(response);
        }

        [HttpPost("suppliers")]
        [HasPermission("Inventory:Add")]
        public async Task<IActionResult> CreateSupplier([FromBody] SupplierUpsertDto request)
        {
            var response = await _masterServices.CreateSupplierAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPut("suppliers")]
        [HasPermission("Inventory:Edit")]
        public async Task<IActionResult> UpdateSupplier([FromBody] SupplierUpsertDto request)
        {
            var response = await _masterServices.UpdateSupplierAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("suppliers/{id}")]
        [HasPermission("Inventory:Delete")]
        public async Task<IActionResult> DeleteSupplier(Guid id)
        {
            var response = await _masterServices.DeleteSupplierAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }
        #endregion

        #region Warehouses
        [HttpGet("warehouses")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetWarehouses()
        {
            var response = await _masterServices.GetWarehousesAsync();
            return Ok(response);
        }

        [HttpGet("warehouses/{id}")]
        [HasPermission("Inventory:View")]
        public async Task<IActionResult> GetWarehouseById(Guid id)
        {
            var response = await _masterServices.GetWarehouseByIdAsync(id);
            if (!response.Succeeded) return NotFound(response);
            return Ok(response);
        }

        [HttpPost("warehouses")]
        [HasPermission("Inventory:Add")]
        public async Task<IActionResult> CreateWarehouse([FromBody] WarehouseUpsertDto request)
        {
            var response = await _masterServices.CreateWarehouseAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpPut("warehouses")]
        [HasPermission("Inventory:Edit")]
        public async Task<IActionResult> UpdateWarehouse([FromBody] WarehouseUpsertDto request)
        {
            var response = await _masterServices.UpdateWarehouseAsync(request);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("warehouses/{id}")]
        [HasPermission("Inventory:Delete")]
        public async Task<IActionResult> DeleteWarehouse(Guid id)
        {
            var response = await _masterServices.DeleteWarehouseAsync(id);
            if (!response.Succeeded) return BadRequest(response);
            return Ok(response);
        }
        #endregion
    }
}
