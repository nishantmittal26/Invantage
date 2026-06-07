using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Masters;

namespace Invantage.Application.Common.Interfaces
{
    public interface IMasterServices
    {
        // Categories
        Task<GenericResponse<List<CategoryDto>>> GetCategoriesAsync();
        Task<GenericResponse<CategoryDto>> GetCategoryByIdAsync(Guid id);
        Task<GenericResponse<CategoryDto>> CreateCategoryAsync(CategoryUpsertDto request);
        Task<GenericResponse<CategoryDto>> UpdateCategoryAsync(CategoryUpsertDto request);
        Task<GenericResponse<bool>> DeleteCategoryAsync(Guid id);

        // Brands
        Task<GenericResponse<List<BrandDto>>> GetBrandsAsync();
        Task<GenericResponse<BrandDto>> GetBrandByIdAsync(Guid id);
        Task<GenericResponse<BrandDto>> CreateBrandAsync(BrandUpsertDto request);
        Task<GenericResponse<BrandDto>> UpdateBrandAsync(BrandUpsertDto request);
        Task<GenericResponse<bool>> DeleteBrandAsync(Guid id);

        // Units
        Task<GenericResponse<List<UnitDto>>> GetUnitsAsync();
        Task<GenericResponse<UnitDto>> GetUnitByIdAsync(Guid id);
        Task<GenericResponse<UnitDto>> CreateUnitAsync(UnitUpsertDto request);
        Task<GenericResponse<UnitDto>> UpdateUnitAsync(UnitUpsertDto request);
        Task<GenericResponse<bool>> DeleteUnitAsync(Guid id);

        // Suppliers
        Task<GenericResponse<List<SupplierDto>>> GetSuppliersAsync();
        Task<GenericResponse<SupplierDto>> GetSupplierByIdAsync(Guid id);
        Task<GenericResponse<SupplierDto>> CreateSupplierAsync(SupplierUpsertDto request);
        Task<GenericResponse<SupplierDto>> UpdateSupplierAsync(SupplierUpsertDto request);
        Task<GenericResponse<bool>> DeleteSupplierAsync(Guid id);

        // Warehouses
        Task<GenericResponse<List<WarehouseDto>>> GetWarehousesAsync();
        Task<GenericResponse<WarehouseDto>> GetWarehouseByIdAsync(Guid id);
        Task<GenericResponse<WarehouseDto>> CreateWarehouseAsync(WarehouseUpsertDto request);
        Task<GenericResponse<WarehouseDto>> UpdateWarehouseAsync(WarehouseUpsertDto request);
        Task<GenericResponse<bool>> DeleteWarehouseAsync(Guid id);
    }
}
