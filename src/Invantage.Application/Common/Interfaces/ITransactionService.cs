using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Transactions;

namespace Invantage.Application.Common.Interfaces
{
    public interface ITransactionService
    {
        // Stock In
        Task<GenericResponse<List<StockInHeaderDto>>> GetStockInsAsync();
        Task<GenericResponse<StockInHeaderDto>> GetStockInByIdAsync(Guid id);
        Task<GenericResponse<StockInHeaderDto>> CreateStockInAsync(StockInCreateDto request);
        Task<GenericResponse<StockInHeaderDto>> ApproveStockInAsync(Guid id);

        // Stock Out
        Task<GenericResponse<List<StockOutHeaderDto>>> GetStockOutsAsync();
        Task<GenericResponse<StockOutHeaderDto>> GetStockOutByIdAsync(Guid id);
        Task<GenericResponse<StockOutHeaderDto>> CreateStockOutAsync(StockOutCreateDto request);
        Task<GenericResponse<StockOutHeaderDto>> ApproveStockOutAsync(Guid id);

        // Inventory Adjustments
        Task<GenericResponse<List<AdjustmentDto>>> GetAdjustmentsAsync();
        Task<GenericResponse<AdjustmentDto>> GetAdjustmentByIdAsync(Guid id);
        Task<GenericResponse<AdjustmentDto>> CreateAdjustmentAsync(AdjustmentCreateDto request);

        // Inventory Transfers
        Task<GenericResponse<List<TransferHeaderDto>>> GetTransfersAsync();
        Task<GenericResponse<TransferHeaderDto>> GetTransferByIdAsync(Guid id);
        Task<GenericResponse<TransferHeaderDto>> CreateTransferAsync(TransferCreateDto request);
        Task<GenericResponse<TransferHeaderDto>> ApproveTransferAsync(Guid id);
        Task<GenericResponse<TransferHeaderDto>> RejectTransferAsync(Guid id);
    }
}
