using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Masters;
using Invantage.Core.Entities;

namespace Invantage.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ISettingsService _auditLog;

        public ProductService(
            IApplicationDbContext context,
            IMapper mapper,
            ISettingsService auditLog)
        {
            _context = context;
            _mapper = mapper;
            _auditLog = auditLog;
        }

        public async Task<GenericResponse<List<ProductDto>>> GetProductsAsync()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Unit)
                .Include(p => p.WarehouseStocks)
                .ToListAsync();

            var dtos = _mapper.Map<List<ProductDto>>(products);
            return GenericResponse<List<ProductDto>>.Success(dtos);
        }

        public async Task<GenericResponse<ProductDto>> GetProductByIdAsync(Guid id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Unit)
                .Include(p => p.WarehouseStocks)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return GenericResponse<ProductDto>.Failure("Product not found.");
            }

            var dto = _mapper.Map<ProductDto>(product);
            return GenericResponse<ProductDto>.Success(dto);
        }

        public async Task<GenericResponse<ProductDto>> CreateProductAsync(ProductUpsertDto request)
        {
            var exists = await _context.Products.AnyAsync(p => p.ProductCode == request.ProductCode || p.SKU == request.SKU);
            if (exists)
            {
                return GenericResponse<ProductDto>.Failure("Product Code or SKU already exists.");
            }

            var product = _mapper.Map<Product>(request);

            if (!string.IsNullOrEmpty(request.ImageBase64))
            {
                product.ImageUrl = SaveProductImage(request.ProductCode, request.ImageBase64);
            }

            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Add", "Products", $"Created product {product.ProductName} ({product.ProductCode})");

            var createdProduct = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Unit)
                .FirstOrDefaultAsync(p => p.Id == product.Id);

            var dto = _mapper.Map<ProductDto>(createdProduct);
            return GenericResponse<ProductDto>.Success(dto, "Product created successfully.");
        }

        public async Task<GenericResponse<ProductDto>> UpdateProductAsync(ProductUpsertDto request)
        {
            if (!request.Id.HasValue)
            {
                return GenericResponse<ProductDto>.Failure("Product ID is required for update.");
            }

            var product = await _context.Products.FindAsync(request.Id.Value);
            if (product == null)
            {
                return GenericResponse<ProductDto>.Failure("Product not found.");
            }

            var exists = await _context.Products.AnyAsync(p => (p.ProductCode == request.ProductCode || p.SKU == request.SKU) && p.Id != request.Id.Value);
            if (exists)
            {
                return GenericResponse<ProductDto>.Failure("Another product already uses the same Product Code or SKU.");
            }

            // Map updated properties
            product.ProductCode = request.ProductCode;
            product.SKU = request.SKU;
            product.ProductName = request.ProductName;
            product.Description = request.Description;
            product.CategoryId = request.CategoryId;
            product.BrandId = request.BrandId;
            product.UnitId = request.UnitId;
            product.ReorderLevel = request.ReorderLevel;
            product.MinimumStock = request.MinimumStock;
            product.MaximumStock = request.MaximumStock;
            product.CostPrice = request.CostPrice;
            product.SellingPrice = request.SellingPrice;
            product.Barcode = request.Barcode;
            product.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(request.ImageBase64))
            {
                // Delete old image if exists
                DeleteProductImage(product.ImageUrl);
                product.ImageUrl = SaveProductImage(request.ProductCode, request.ImageBase64);
            }
            else if (request.ImageUrl != null)
            {
                product.ImageUrl = request.ImageUrl;
            }

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Edit", "Products", $"Updated product {product.ProductName} ({product.ProductCode})");

            var updatedProduct = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Unit)
                .FirstOrDefaultAsync(p => p.Id == product.Id);

            var dto = _mapper.Map<ProductDto>(updatedProduct);
            return GenericResponse<ProductDto>.Success(dto, "Product updated successfully.");
        }

        public async Task<GenericResponse<bool>> DeleteProductAsync(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return GenericResponse<bool>.Failure("Product not found.");
            }

            // Check if product is in stock
            var hasStock = await _context.WarehouseStocks.AnyAsync(ws => ws.ProductId == id && ws.CurrentStock > 0);
            if (hasStock)
            {
                return GenericResponse<bool>.Failure("Cannot delete product. Item is currently in stock inside one or more warehouses.");
            }

            // Check if product has transaction history
            var hasStockIn = await _context.StockInDetails.AnyAsync(d => d.ProductId == id);
            var hasStockOut = await _context.StockOutDetails.AnyAsync(d => d.ProductId == id);
            var hasPO = await _context.PurchaseOrderDetails.AnyAsync(d => d.ProductId == id);

            if (hasStockIn || hasStockOut || hasPO)
            {
                return GenericResponse<bool>.Failure("Cannot delete product. Transactions history exists for this product. Archive instead.");
            }

            DeleteProductImage(product.ImageUrl);
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Delete", "Products", $"Deleted product {product.ProductName}");

            return GenericResponse<bool>.Success(true, "Product deleted successfully.");
        }

        public async Task<GenericResponse<ProductDto>> GetProductByBarcodeAsync(string barcode)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Unit)
                .Include(p => p.WarehouseStocks)
                .FirstOrDefaultAsync(p => p.Barcode == barcode);

            if (product == null)
            {
                return GenericResponse<ProductDto>.Failure("Product with this barcode was not found.");
            }

            var dto = _mapper.Map<ProductDto>(product);
            return GenericResponse<ProductDto>.Success(dto);
        }

        public async Task<GenericResponse<List<WarehouseStockDto>>> GetWarehouseStocksAsync(Guid productId)
        {
            var stocks = await _context.WarehouseStocks
                .Include(ws => ws.Warehouse)
                .Include(ws => ws.Product)
                .Where(ws => ws.ProductId == productId)
                .ToListAsync();

            var dtos = _mapper.Map<List<WarehouseStockDto>>(stocks);
            return GenericResponse<List<WarehouseStockDto>>.Success(dtos);
        }

        public async Task<GenericResponse<List<WarehouseStockDto>>> GetAllWarehouseStocksAsync()
        {
            var stocks = await _context.WarehouseStocks
                .Include(ws => ws.Warehouse)
                .Include(ws => ws.Product)
                .ToListAsync();

            var dtos = _mapper.Map<List<WarehouseStockDto>>(stocks);
            return GenericResponse<List<WarehouseStockDto>>.Success(dtos);
        }

        #region Helper Methods
        private string? SaveProductImage(string productCode, string base64String)
        {
            if (string.IsNullOrEmpty(base64String)) return null;

            try
            {
                var base64Data = base64String;
                var extension = ".png";

                if (base64String.Contains(","))
                {
                    var parts = base64String.Split(',');
                    base64Data = parts[1];
                    var header = parts[0];
                    if (header.Contains("jpeg") || header.Contains("jpg")) extension = ".jpg";
                    else if (header.Contains("gif")) extension = ".gif";
                    else if (header.Contains("webp")) extension = ".webp";
                }

                var bytes = Convert.FromBase64String(base64Data);
                var dirPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
                
                if (!Directory.Exists(dirPath))
                {
                    Directory.CreateDirectory(dirPath);
                }

                var fileName = $"{productCode}_{Guid.NewGuid().ToString().Substring(0, 8)}{extension}";
                var filePath = Path.Combine(dirPath, fileName);
                File.WriteAllBytes(filePath, bytes);

                return $"/images/products/{fileName}";
            }
            catch (Exception)
            {
                return null;
            }
        }

        private void DeleteProductImage(string? imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl)) return;

            try
            {
                var relativePath = imageUrl.TrimStart('/');
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath.Replace('/', Path.DirectorySeparatorChar));
                
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch (Exception)
            {
                // Ignore failure to delete old image
            }
        }
        #endregion
    }
}
