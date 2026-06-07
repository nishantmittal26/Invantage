using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Purchase;

namespace Invantage.Application.Common.Interfaces
{
    public interface IPurchaseOrderService
    {
        Task<GenericResponse<List<PurchaseOrderDto>>> GetPurchaseOrdersAsync();
        Task<GenericResponse<PurchaseOrderDto>> GetPurchaseOrderByIdAsync(Guid id);
        Task<GenericResponse<PurchaseOrderDto>> CreatePurchaseOrderAsync(PurchaseOrderCreateDto request);
        Task<GenericResponse<PurchaseOrderDto>> ApprovePurchaseOrderAsync(Guid id);
        Task<GenericResponse<PurchaseOrderDto>> ReceivePurchaseOrderAsync(Guid id);
        Task<GenericResponse<PurchaseOrderDto>> RejectPurchaseOrderAsync(Guid id);
    }
}
