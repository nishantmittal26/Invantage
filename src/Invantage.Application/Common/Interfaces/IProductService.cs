using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Masters;

namespace Invantage.Application.Common.Interfaces
{
    public interface IProductService
    {
        Task<GenericResponse<List<ProductDto>>> GetProductsAsync();
        Task<GenericResponse<ProductDto>> GetProductByIdAsync(Guid id);
        Task<GenericResponse<ProductDto>> CreateProductAsync(ProductUpsertDto request);
        Task<GenericResponse<ProductDto>> UpdateProductAsync(ProductUpsertDto request);
        Task<GenericResponse<bool>> DeleteProductAsync(Guid id);
        Task<GenericResponse<ProductDto>> GetProductByBarcodeAsync(string barcode);
        Task<GenericResponse<List<WarehouseStockDto>>> GetWarehouseStocksAsync(Guid productId);
        Task<GenericResponse<List<WarehouseStockDto>>> GetAllWarehouseStocksAsync();
    }
}
