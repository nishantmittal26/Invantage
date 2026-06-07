using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Masters;
using Invantage.Core.Entities;

namespace Invantage.Application.Services
{
    public class MasterServices : IMasterServices
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ISettingsService _auditLog;

        public MasterServices(
            IApplicationDbContext context,
            IMapper mapper,
            ISettingsService auditLog)
        {
            _context = context;
            _mapper = mapper;
            _auditLog = auditLog;
        }

        #region Categories
        public async Task<GenericResponse<List<CategoryDto>>> GetCategoriesAsync()
        {
            var items = await _context.Categories.ToListAsync();
            var dtos = _mapper.Map<List<CategoryDto>>(items);
            return GenericResponse<List<CategoryDto>>.Success(dtos);
        }

        public async Task<GenericResponse<CategoryDto>> GetCategoryByIdAsync(Guid id)
        {
            var item = await _context.Categories.FindAsync(id);
            if (item == null) return GenericResponse<CategoryDto>.Failure("Category not found.");
            var dto = _mapper.Map<CategoryDto>(item);
            return GenericResponse<CategoryDto>.Success(dto);
        }

        public async Task<GenericResponse<CategoryDto>> CreateCategoryAsync(CategoryUpsertDto request)
        {
            var category = _mapper.Map<Category>(request);
            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Add", "Categories", $"Created Category {category.CategoryName}");

            var dto = _mapper.Map<CategoryDto>(category);
            return GenericResponse<CategoryDto>.Success(dto, "Category created successfully.");
        }

        public async Task<GenericResponse<CategoryDto>> UpdateCategoryAsync(CategoryUpsertDto request)
        {
            if (!request.Id.HasValue) return GenericResponse<CategoryDto>.Failure("Category ID is required.");
            var category = await _context.Categories.FindAsync(request.Id.Value);
            if (category == null) return GenericResponse<CategoryDto>.Failure("Category not found.");

            category.CategoryName = request.CategoryName;
            category.Description = request.Description;
            category.UpdatedAt = DateTime.UtcNow;

            _context.Categories.Update(category);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Edit", "Categories", $"Updated Category {category.CategoryName}");

            var dto = _mapper.Map<CategoryDto>(category);
            return GenericResponse<CategoryDto>.Success(dto, "Category updated successfully.");
        }

        public async Task<GenericResponse<bool>> DeleteCategoryAsync(Guid id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return GenericResponse<bool>.Failure("Category not found.");

            var inUse = await _context.Products.AnyAsync(p => p.CategoryId == id);
            if (inUse) return GenericResponse<bool>.Failure("Cannot delete category. It is referenced by active products.");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Delete", "Categories", $"Deleted Category {category.CategoryName}");

            return GenericResponse<bool>.Success(true, "Category deleted successfully.");
        }
        #endregion

        #region Brands
        public async Task<GenericResponse<List<BrandDto>>> GetBrandsAsync()
        {
            var items = await _context.Brands.ToListAsync();
            var dtos = _mapper.Map<List<BrandDto>>(items);
            return GenericResponse<List<BrandDto>>.Success(dtos);
        }

        public async Task<GenericResponse<BrandDto>> GetBrandByIdAsync(Guid id)
        {
            var item = await _context.Brands.FindAsync(id);
            if (item == null) return GenericResponse<BrandDto>.Failure("Brand not found.");
            var dto = _mapper.Map<BrandDto>(item);
            return GenericResponse<BrandDto>.Success(dto);
        }

        public async Task<GenericResponse<BrandDto>> CreateBrandAsync(BrandUpsertDto request)
        {
            var brand = _mapper.Map<Brand>(request);
            await _context.Brands.AddAsync(brand);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Add", "Brands", $"Created Brand {brand.BrandName}");

            var dto = _mapper.Map<BrandDto>(brand);
            return GenericResponse<BrandDto>.Success(dto, "Brand created successfully.");
        }

        public async Task<GenericResponse<BrandDto>> UpdateBrandAsync(BrandUpsertDto request)
        {
            if (!request.Id.HasValue) return GenericResponse<BrandDto>.Failure("Brand ID is required.");
            var brand = await _context.Brands.FindAsync(request.Id.Value);
            if (brand == null) return GenericResponse<BrandDto>.Failure("Brand not found.");

            brand.BrandName = request.BrandName;
            brand.Description = request.Description;
            brand.UpdatedAt = DateTime.UtcNow;

            _context.Brands.Update(brand);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Edit", "Brands", $"Updated Brand {brand.BrandName}");

            var dto = _mapper.Map<BrandDto>(brand);
            return GenericResponse<BrandDto>.Success(dto, "Brand updated successfully.");
        }

        public async Task<GenericResponse<bool>> DeleteBrandAsync(Guid id)
        {
            var brand = await _context.Brands.FindAsync(id);
            if (brand == null) return GenericResponse<bool>.Failure("Brand not found.");

            var inUse = await _context.Products.AnyAsync(p => p.BrandId == id);
            if (inUse) return GenericResponse<bool>.Failure("Cannot delete brand. It is referenced by active products.");

            _context.Brands.Remove(brand);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Delete", "Brands", $"Deleted Brand {brand.BrandName}");

            return GenericResponse<bool>.Success(true, "Brand deleted successfully.");
        }
        #endregion

        #region Units
        public async Task<GenericResponse<List<UnitDto>>> GetUnitsAsync()
        {
            var items = await _context.Units.ToListAsync();
            var dtos = _mapper.Map<List<UnitDto>>(items);
            return GenericResponse<List<UnitDto>>.Success(dtos);
        }

        public async Task<GenericResponse<UnitDto>> GetUnitByIdAsync(Guid id)
        {
            var item = await _context.Units.FindAsync(id);
            if (item == null) return GenericResponse<UnitDto>.Failure("Unit not found.");
            var dto = _mapper.Map<UnitDto>(item);
            return GenericResponse<UnitDto>.Success(dto);
        }

        public async Task<GenericResponse<UnitDto>> CreateUnitAsync(UnitUpsertDto request)
        {
            var unit = _mapper.Map<Unit>(request);
            await _context.Units.AddAsync(unit);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Add", "Units", $"Created Unit {unit.UnitName}");

            var dto = _mapper.Map<UnitDto>(unit);
            return GenericResponse<UnitDto>.Success(dto, "Unit created successfully.");
        }

        public async Task<GenericResponse<UnitDto>> UpdateUnitAsync(UnitUpsertDto request)
        {
            if (!request.Id.HasValue) return GenericResponse<UnitDto>.Failure("Unit ID is required.");
            var unit = await _context.Units.FindAsync(request.Id.Value);
            if (unit == null) return GenericResponse<UnitDto>.Failure("Unit not found.");

            unit.UnitName = request.UnitName;
            unit.UpdatedAt = DateTime.UtcNow;

            _context.Units.Update(unit);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Edit", "Units", $"Updated Unit {unit.UnitName}");

            var dto = _mapper.Map<UnitDto>(unit);
            return GenericResponse<UnitDto>.Success(dto, "Unit updated successfully.");
        }

        public async Task<GenericResponse<bool>> DeleteUnitAsync(Guid id)
        {
            var unit = await _context.Units.FindAsync(id);
            if (unit == null) return GenericResponse<bool>.Failure("Unit not found.");

            var inUse = await _context.Products.AnyAsync(p => p.UnitId == id);
            if (inUse) return GenericResponse<bool>.Failure("Cannot delete unit. It is referenced by active products.");

            _context.Units.Remove(unit);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Delete", "Units", $"Deleted Unit {unit.UnitName}");

            return GenericResponse<bool>.Success(true, "Unit deleted successfully.");
        }
        #endregion

        #region Suppliers
        public async Task<GenericResponse<List<SupplierDto>>> GetSuppliersAsync()
        {
            var items = await _context.Suppliers.ToListAsync();
            var dtos = _mapper.Map<List<SupplierDto>>(items);
            return GenericResponse<List<SupplierDto>>.Success(dtos);
        }

        public async Task<GenericResponse<SupplierDto>> GetSupplierByIdAsync(Guid id)
        {
            var item = await _context.Suppliers.FindAsync(id);
            if (item == null) return GenericResponse<SupplierDto>.Failure("Supplier not found.");
            var dto = _mapper.Map<SupplierDto>(item);
            return GenericResponse<SupplierDto>.Success(dto);
        }

        public async Task<GenericResponse<SupplierDto>> CreateSupplierAsync(SupplierUpsertDto request)
        {
            var supplier = _mapper.Map<Supplier>(request);
            await _context.Suppliers.AddAsync(supplier);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Add", "Suppliers", $"Created Supplier {supplier.SupplierName}");

            var dto = _mapper.Map<SupplierDto>(supplier);
            return GenericResponse<SupplierDto>.Success(dto, "Supplier created successfully.");
        }

        public async Task<GenericResponse<SupplierDto>> UpdateSupplierAsync(SupplierUpsertDto request)
        {
            if (!request.Id.HasValue) return GenericResponse<SupplierDto>.Failure("Supplier ID is required.");
            var supplier = await _context.Suppliers.FindAsync(request.Id.Value);
            if (supplier == null) return GenericResponse<SupplierDto>.Failure("Supplier not found.");

            supplier.SupplierName = request.SupplierName;
            supplier.ContactPerson = request.ContactPerson;
            supplier.Email = request.Email;
            supplier.Mobile = request.Mobile;
            supplier.GSTNumber = request.GSTNumber;
            supplier.Address = request.Address;
            supplier.City = request.City;
            supplier.State = request.State;
            supplier.Country = request.Country;
            supplier.UpdatedAt = DateTime.UtcNow;

            _context.Suppliers.Update(supplier);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Edit", "Suppliers", $"Updated Supplier {supplier.SupplierName}");

            var dto = _mapper.Map<SupplierDto>(supplier);
            return GenericResponse<SupplierDto>.Success(dto, "Supplier updated successfully.");
        }

        public async Task<GenericResponse<bool>> DeleteSupplierAsync(Guid id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return GenericResponse<bool>.Failure("Supplier not found.");

            var inUse = await _context.PurchaseOrders.AnyAsync(po => po.SupplierId == id);
            if (inUse) return GenericResponse<bool>.Failure("Cannot delete supplier. They have purchase orders registered in the system.");

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Delete", "Suppliers", $"Deleted Supplier {supplier.SupplierName}");

            return GenericResponse<bool>.Success(true, "Supplier deleted successfully.");
        }
        #endregion

        #region Warehouses
        public async Task<GenericResponse<List<WarehouseDto>>> GetWarehousesAsync()
        {
            var items = await _context.Warehouses.ToListAsync();
            var dtos = _mapper.Map<List<WarehouseDto>>(items);
            return GenericResponse<List<WarehouseDto>>.Success(dtos);
        }

        public async Task<GenericResponse<WarehouseDto>> GetWarehouseByIdAsync(Guid id)
        {
            var item = await _context.Warehouses.FindAsync(id);
            if (item == null) return GenericResponse<WarehouseDto>.Failure("Warehouse not found.");
            var dto = _mapper.Map<WarehouseDto>(item);
            return GenericResponse<WarehouseDto>.Success(dto);
        }

        public async Task<GenericResponse<WarehouseDto>> CreateWarehouseAsync(WarehouseUpsertDto request)
        {
            var exists = await _context.Warehouses.AnyAsync(w => w.WarehouseCode == request.WarehouseCode);
            if (exists) return GenericResponse<WarehouseDto>.Failure("Warehouse Code already exists.");

            var warehouse = _mapper.Map<Warehouse>(request);
            await _context.Warehouses.AddAsync(warehouse);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Add", "Warehouses", $"Created Warehouse {warehouse.WarehouseName} ({warehouse.WarehouseCode})");

            var dto = _mapper.Map<WarehouseDto>(warehouse);
            return GenericResponse<WarehouseDto>.Success(dto, "Warehouse created successfully.");
        }

        public async Task<GenericResponse<WarehouseDto>> UpdateWarehouseAsync(WarehouseUpsertDto request)
        {
            if (!request.Id.HasValue) return GenericResponse<WarehouseDto>.Failure("Warehouse ID is required.");
            var warehouse = await _context.Warehouses.FindAsync(request.Id.Value);
            if (warehouse == null) return GenericResponse<WarehouseDto>.Failure("Warehouse not found.");

            var exists = await _context.Warehouses.AnyAsync(w => w.WarehouseCode == request.WarehouseCode && w.Id != request.Id.Value);
            if (exists) return GenericResponse<WarehouseDto>.Failure("Another warehouse is already using code '" + request.WarehouseCode + "'.");

            warehouse.WarehouseCode = request.WarehouseCode;
            warehouse.WarehouseName = request.WarehouseName;
            warehouse.Address = request.Address;
            warehouse.Manager = request.Manager;
            warehouse.UpdatedAt = DateTime.UtcNow;

            _context.Warehouses.Update(warehouse);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Edit", "Warehouses", $"Updated Warehouse {warehouse.WarehouseName} ({warehouse.WarehouseCode})");

            var dto = _mapper.Map<WarehouseDto>(warehouse);
            return GenericResponse<WarehouseDto>.Success(dto, "Warehouse updated successfully.");
        }

        public async Task<GenericResponse<bool>> DeleteWarehouseAsync(Guid id)
        {
            var warehouse = await _context.Warehouses.FindAsync(id);
            if (warehouse == null) return GenericResponse<bool>.Failure("Warehouse not found.");

            var hasStock = await _context.WarehouseStocks.AnyAsync(ws => ws.WarehouseId == id && ws.CurrentStock > 0);
            if (hasStock) return GenericResponse<bool>.Failure("Cannot delete warehouse. It currently contains active product stocks.");

            // Remove empty stocks configurations
            var emptyStocks = await _context.WarehouseStocks.Where(ws => ws.WarehouseId == id).ToListAsync();
            _context.WarehouseStocks.RemoveRange(emptyStocks);

            _context.Warehouses.Remove(warehouse);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Delete", "Warehouses", $"Deleted Warehouse {warehouse.WarehouseName}");

            return GenericResponse<bool>.Success(true, "Warehouse deleted successfully.");
        }
        #endregion
    }
}
