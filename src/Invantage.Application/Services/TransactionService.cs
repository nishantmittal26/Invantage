using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Transactions;
using Invantage.Core.Entities;
using Invantage.Core.Enums;

namespace Invantage.Application.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ISettingsService _auditLog;
        private readonly INotificationService _notifications;
        private readonly IEmailService _email;

        public TransactionService(
            IApplicationDbContext context,
            IMapper mapper,
            ISettingsService auditLog,
            INotificationService notifications,
            IEmailService email)
        {
            _context = context;
            _mapper = mapper;
            _auditLog = auditLog;
            _notifications = notifications;
            _email = email;
        }

        #region Stock In
        public async Task<GenericResponse<List<StockInHeaderDto>>> GetStockInsAsync()
        {
            var items = await _context.StockInHeaders
                .Include(s => s.Supplier)
                .Include(s => s.Warehouse)
                .Include(s => s.Details)
                    .ThenInclude(d => d.Product)
                .ToListAsync();

            var dtos = _mapper.Map<List<StockInHeaderDto>>(items);
            return GenericResponse<List<StockInHeaderDto>>.Success(dtos);
        }

        public async Task<GenericResponse<StockInHeaderDto>> GetStockInByIdAsync(Guid id)
        {
            var item = await _context.StockInHeaders
                .Include(s => s.Supplier)
                .Include(s => s.Warehouse)
                .Include(s => s.Details)
                    .ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (item == null) return GenericResponse<StockInHeaderDto>.Failure("Stock In transaction not found.");
            var dto = _mapper.Map<StockInHeaderDto>(item);
            return GenericResponse<StockInHeaderDto>.Success(dto);
        }

        public async Task<GenericResponse<StockInHeaderDto>> CreateStockInAsync(StockInCreateDto request)
        {
            using var transaction = await _context.BeginTransactionAsync();
            try
            {
                var count = await _context.StockInHeaders.CountAsync();
                var transactionNo = $"STK-IN-{DateTime.UtcNow:yyyyMMdd}-{count + 1:D4}";

                var header = new StockInHeader
                {
                    TransactionNo = transactionNo,
                    Date = DateTime.UtcNow,
                    SupplierId = request.SupplierId,
                    WarehouseId = request.WarehouseId,
                    Status = TransactionStatus.Draft
                };

                foreach (var detail in request.Details)
                {
                    header.Details.Add(new StockInDetail
                    {
                        ProductId = detail.ProductId,
                        Quantity = detail.Quantity,
                        CostPrice = detail.CostPrice,
                        BatchNumber = detail.BatchNumber,
                        ExpiryDate = detail.ExpiryDate
                    });
                }

                await _context.StockInHeaders.AddAsync(header);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                await _auditLog.CreateAuditLogAsync("Add", "StockIn", $"Saved Stock In draft {transactionNo}");

                var dto = _mapper.Map<StockInHeaderDto>(header);
                return GenericResponse<StockInHeaderDto>.Success(dto, "Stock In saved as draft.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return GenericResponse<StockInHeaderDto>.Failure("Failed to create Stock In transaction. Details: " + ex.Message);
            }
        }

        public async Task<GenericResponse<StockInHeaderDto>> ApproveStockInAsync(Guid id)
        {
            var header = await _context.StockInHeaders
                .Include(s => s.Details)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (header == null) return GenericResponse<StockInHeaderDto>.Failure("Stock In transaction not found.");
            if (header.Status != TransactionStatus.Draft) return GenericResponse<StockInHeaderDto>.Failure("Transaction is already approved or rejected.");

            using var dbTransaction = await _context.BeginTransactionAsync();
            try
            {
                header.Status = TransactionStatus.Approved;
                header.ApprovedDate = DateTime.UtcNow;
                header.ApprovedBy = "Admin"; // Will be updated by ICurrentUserService in API controllers

                // Update WarehouseStock
                foreach (var item in header.Details)
                {
                    var stock = await _context.WarehouseStocks
                        .FirstOrDefaultAsync(ws => ws.WarehouseId == header.WarehouseId && ws.ProductId == item.ProductId);

                    if (stock == null)
                    {
                        stock = new WarehouseStock
                        {
                            WarehouseId = header.WarehouseId,
                            ProductId = item.ProductId,
                            CurrentStock = item.Quantity,
                            LastUpdated = DateTime.UtcNow
                        };
                        await _context.WarehouseStocks.AddAsync(stock);
                    }
                    else
                    {
                        stock.CurrentStock += item.Quantity;
                        stock.LastUpdated = DateTime.UtcNow;
                        _context.WarehouseStocks.Update(stock);
                    }

                    // Check for Expiry Notification if ExpiryDate is set
                    if (item.ExpiryDate.HasValue && item.ExpiryDate.Value <= DateTime.UtcNow.AddDays(30))
                    {
                        var product = await _context.Products.FindAsync(item.ProductId);
                        if (product != null)
                        {
                            var days = (item.ExpiryDate.Value - DateTime.UtcNow).Days;
                            await _notifications.CreateNotificationAsync(
                                $"Expiry Alert: Batch {item.BatchNumber} for product {product.ProductName} in warehouse {header.WarehouseId} expires in {days} days.",
                                "ExpiryAlert",
                                null
                            );
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                await _auditLog.CreateAuditLogAsync("Approve", "StockIn", $"Approved Stock In {header.TransactionNo}");

                var dto = _mapper.Map<StockInHeaderDto>(header);
                return GenericResponse<StockInHeaderDto>.Success(dto, "Stock In approved and stock updated.");
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                return GenericResponse<StockInHeaderDto>.Failure("Failed to approve Stock In. Details: " + ex.Message);
            }
        }
        #endregion

        #region Stock Out
        public async Task<GenericResponse<List<StockOutHeaderDto>>> GetStockOutsAsync()
        {
            var items = await _context.StockOutHeaders
                .Include(s => s.Warehouse)
                .Include(s => s.Details)
                    .ThenInclude(d => d.Product)
                .ToListAsync();

            var dtos = _mapper.Map<List<StockOutHeaderDto>>(items);
            return GenericResponse<List<StockOutHeaderDto>>.Success(dtos);
        }

        public async Task<GenericResponse<StockOutHeaderDto>> GetStockOutByIdAsync(Guid id)
        {
            var item = await _context.StockOutHeaders
                .Include(s => s.Warehouse)
                .Include(s => s.Details)
                    .ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (item == null) return GenericResponse<StockOutHeaderDto>.Failure("Stock Out transaction not found.");
            var dto = _mapper.Map<StockOutHeaderDto>(item);
            return GenericResponse<StockOutHeaderDto>.Success(dto);
        }

        public async Task<GenericResponse<StockOutHeaderDto>> CreateStockOutAsync(StockOutCreateDto request)
        {
            using var transaction = await _context.BeginTransactionAsync();
            try
            {
                var count = await _context.StockOutHeaders.CountAsync();
                var transactionNo = $"STK-OUT-{DateTime.UtcNow:yyyyMMdd}-{count + 1:D4}";

                var header = new StockOutHeader
                {
                    TransactionNo = transactionNo,
                    Date = DateTime.UtcNow,
                    WarehouseId = request.WarehouseId,
                    DepartmentOrUser = request.DepartmentOrUser,
                    Status = TransactionStatus.Draft
                };

                foreach (var detail in request.Details)
                {
                    header.Details.Add(new StockOutDetail
                    {
                        ProductId = detail.ProductId,
                        Quantity = detail.Quantity
                    });
                }

                await _context.StockOutHeaders.AddAsync(header);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                await _auditLog.CreateAuditLogAsync("Add", "StockOut", $"Saved Stock Out draft {transactionNo}");

                var dto = _mapper.Map<StockOutHeaderDto>(header);
                return GenericResponse<StockOutHeaderDto>.Success(dto, "Stock Out saved as draft.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return GenericResponse<StockOutHeaderDto>.Failure("Failed to create Stock Out transaction. Details: " + ex.Message);
            }
        }

        public async Task<GenericResponse<StockOutHeaderDto>> ApproveStockOutAsync(Guid id)
        {
            var header = await _context.StockOutHeaders
                .Include(s => s.Details)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (header == null) return GenericResponse<StockOutHeaderDto>.Failure("Stock Out transaction not found.");
            if (header.Status != TransactionStatus.Draft) return GenericResponse<StockOutHeaderDto>.Failure("Transaction is already approved or rejected.");

            // Verify stock is sufficient in database first
            foreach (var item in header.Details)
            {
                var stock = await _context.WarehouseStocks
                    .FirstOrDefaultAsync(ws => ws.WarehouseId == header.WarehouseId && ws.ProductId == item.ProductId);

                if (stock == null || stock.CurrentStock < item.Quantity)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    var currentQty = stock?.CurrentStock ?? 0;
                    return GenericResponse<StockOutHeaderDto>.Failure($"Insufficient stock for product '{product?.ProductName ?? "Unknown"}'. Available: {currentQty}, Requested: {item.Quantity}");
                }
            }

            using var dbTransaction = await _context.BeginTransactionAsync();
            try
            {
                header.Status = TransactionStatus.Approved;
                header.ApprovedDate = DateTime.UtcNow;
                header.ApprovedBy = "Admin";

                // Deduct stocks
                foreach (var item in header.Details)
                {
                    var stock = await _context.WarehouseStocks
                        .FirstAsync(ws => ws.WarehouseId == header.WarehouseId && ws.ProductId == item.ProductId);

                    stock.CurrentStock -= item.Quantity;
                    stock.LastUpdated = DateTime.UtcNow;
                    _context.WarehouseStocks.Update(stock);

                    // Low stock checking
                    await CheckAndTriggerLowStockAlert(item.ProductId);
                }

                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                await _auditLog.CreateAuditLogAsync("Approve", "StockOut", $"Approved Stock Out {header.TransactionNo}");

                var dto = _mapper.Map<StockOutHeaderDto>(header);
                return GenericResponse<StockOutHeaderDto>.Success(dto, "Stock Out approved and stock deducted.");
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                return GenericResponse<StockOutHeaderDto>.Failure("Failed to approve Stock Out. Details: " + ex.Message);
            }
        }
        #endregion

        #region Inventory Adjustments
        public async Task<GenericResponse<List<AdjustmentDto>>> GetAdjustmentsAsync()
        {
            var items = await _context.InventoryAdjustments
                .Include(a => a.Product)
                .Include(a => a.Warehouse)
                .ToListAsync();

            var dtos = _mapper.Map<List<AdjustmentDto>>(items);
            return GenericResponse<List<AdjustmentDto>>.Success(dtos);
        }

        public async Task<GenericResponse<AdjustmentDto>> GetAdjustmentByIdAsync(Guid id)
        {
            var item = await _context.InventoryAdjustments
                .Include(a => a.Product)
                .Include(a => a.Warehouse)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (item == null) return GenericResponse<AdjustmentDto>.Failure("Adjustment not found.");
            var dto = _mapper.Map<AdjustmentDto>(item);
            return GenericResponse<AdjustmentDto>.Success(dto);
        }

        public async Task<GenericResponse<AdjustmentDto>> CreateAdjustmentAsync(AdjustmentCreateDto request)
        {
            var stock = await _context.WarehouseStocks
                .FirstOrDefaultAsync(ws => ws.WarehouseId == request.WarehouseId && ws.ProductId == request.ProductId);

            var currentQty = stock?.CurrentStock ?? 0;
            if (currentQty + request.AdjustQuantity < 0)
            {
                return GenericResponse<AdjustmentDto>.Failure($"Invalid adjustment quantity. Deduction of {Math.Abs(request.AdjustQuantity)} exceeds current stock of {currentQty}.");
            }

            using var transaction = await _context.BeginTransactionAsync();
            try
            {
                var adjustment = new InventoryAdjustment
                {
                    ProductId = request.ProductId,
                    WarehouseId = request.WarehouseId,
                    CurrentStock = currentQty,
                    AdjustQuantity = request.AdjustQuantity,
                    Reason = request.Reason,
                    Remarks = request.Remarks
                };

                await _context.InventoryAdjustments.AddAsync(adjustment);

                // Update stock directly
                if (stock == null)
                {
                    stock = new WarehouseStock
                    {
                        WarehouseId = request.WarehouseId,
                        ProductId = request.ProductId,
                        CurrentStock = request.AdjustQuantity,
                        LastUpdated = DateTime.UtcNow
                    };
                    await _context.WarehouseStocks.AddAsync(stock);
                }
                else
                {
                    stock.CurrentStock += request.AdjustQuantity;
                    stock.LastUpdated = DateTime.UtcNow;
                    _context.WarehouseStocks.Update(stock);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var product = await _context.Products.FindAsync(request.ProductId);
                await _auditLog.CreateAuditLogAsync("Add", "Adjustments", $"Created stock adjustment for {product?.ProductName} in warehouse. Adjusted: {request.AdjustQuantity}");

                // Low stock checking
                await CheckAndTriggerLowStockAlert(request.ProductId);

                var createdItem = await _context.InventoryAdjustments
                    .Include(a => a.Product)
                    .Include(a => a.Warehouse)
                    .FirstAsync(a => a.Id == adjustment.Id);

                var dto = _mapper.Map<AdjustmentDto>(createdItem);
                return GenericResponse<AdjustmentDto>.Success(dto, "Adjustment saved and stock updated.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return GenericResponse<AdjustmentDto>.Failure("Failed to save stock adjustment. Details: " + ex.Message);
            }
        }
        #endregion

        #region Inventory Transfers
        public async Task<GenericResponse<List<TransferHeaderDto>>> GetTransfersAsync()
        {
            var items = await _context.TransferHeaders
                .Include(t => t.SourceWarehouse)
                .Include(t => t.DestinationWarehouse)
                .Include(t => t.Details)
                    .ThenInclude(d => d.Product)
                .ToListAsync();

            var dtos = _mapper.Map<List<TransferHeaderDto>>(items);
            return GenericResponse<List<TransferHeaderDto>>.Success(dtos);
        }

        public async Task<GenericResponse<TransferHeaderDto>> GetTransferByIdAsync(Guid id)
        {
            var item = await _context.TransferHeaders
                .Include(t => t.SourceWarehouse)
                .Include(t => t.DestinationWarehouse)
                .Include(t => t.Details)
                    .ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (item == null) return GenericResponse<TransferHeaderDto>.Failure("Transfer record not found.");
            var dto = _mapper.Map<TransferHeaderDto>(item);
            return GenericResponse<TransferHeaderDto>.Success(dto);
        }

        public async Task<GenericResponse<TransferHeaderDto>> CreateTransferAsync(TransferCreateDto request)
        {
            using var transaction = await _context.BeginTransactionAsync();
            try
            {
                var count = await _context.TransferHeaders.CountAsync();
                var transactionNo = $"TRSF-{DateTime.UtcNow:yyyyMMdd}-{count + 1:D4}";

                var header = new TransferHeader
                {
                    TransactionNo = transactionNo,
                    Date = DateTime.UtcNow,
                    SourceWarehouseId = request.SourceWarehouseId,
                    DestinationWarehouseId = request.DestinationWarehouseId,
                    Status = TransactionStatus.Draft
                };

                foreach (var detail in request.Details)
                {
                    header.Details.Add(new TransferDetail
                    {
                        ProductId = detail.ProductId,
                        Quantity = detail.Quantity
                    });
                }

                await _context.TransferHeaders.AddAsync(header);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _auditLog.CreateAuditLogAsync("Add", "Transfers", $"Requested Warehouse Transfer {transactionNo}");

                var dto = _mapper.Map<TransferHeaderDto>(header);
                return GenericResponse<TransferHeaderDto>.Success(dto, "Transfer request submitted.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return GenericResponse<TransferHeaderDto>.Failure("Failed to request transfer. Details: " + ex.Message);
            }
        }

        public async Task<GenericResponse<TransferHeaderDto>> ApproveTransferAsync(Guid id)
        {
            var header = await _context.TransferHeaders
                .Include(t => t.Details)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (header == null) return GenericResponse<TransferHeaderDto>.Failure("Transfer request not found.");
            if (header.Status != TransactionStatus.Draft) return GenericResponse<TransferHeaderDto>.Failure("Transfer is already processed.");

            // Verify source warehouse has sufficient stock
            foreach (var item in header.Details)
            {
                var stock = await _context.WarehouseStocks
                    .FirstOrDefaultAsync(ws => ws.WarehouseId == header.SourceWarehouseId && ws.ProductId == item.ProductId);

                if (stock == null || stock.CurrentStock < item.Quantity)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    return GenericResponse<TransferHeaderDto>.Failure($"Source warehouse has insufficient stock for product '{product?.ProductName}'. Required: {item.Quantity}, Current stock: {stock?.CurrentStock ?? 0}");
                }
            }

            using var dbTransaction = await _context.BeginTransactionAsync();
            try
            {
                header.Status = TransactionStatus.Approved;
                header.ApprovedDate = DateTime.UtcNow;
                header.ApprovedBy = "Admin";

                // Deduct from Source and Add to Destination
                foreach (var item in header.Details)
                {
                    // Deduct
                    var srcStock = await _context.WarehouseStocks
                        .FirstAsync(ws => ws.WarehouseId == header.SourceWarehouseId && ws.ProductId == item.ProductId);
                    srcStock.CurrentStock -= item.Quantity;
                    srcStock.LastUpdated = DateTime.UtcNow;
                    _context.WarehouseStocks.Update(srcStock);

                    // Add
                    var destStock = await _context.WarehouseStocks
                        .FirstOrDefaultAsync(ws => ws.WarehouseId == header.DestinationWarehouseId && ws.ProductId == item.ProductId);

                    if (destStock == null)
                    {
                        destStock = new WarehouseStock
                        {
                            WarehouseId = header.DestinationWarehouseId,
                            ProductId = item.ProductId,
                            CurrentStock = item.Quantity,
                            LastUpdated = DateTime.UtcNow
                        };
                        await _context.WarehouseStocks.AddAsync(destStock);
                    }
                    else
                    {
                        destStock.CurrentStock += item.Quantity;
                        destStock.LastUpdated = DateTime.UtcNow;
                        _context.WarehouseStocks.Update(destStock);
                    }

                    // Check low stock
                    await CheckAndTriggerLowStockAlert(item.ProductId);
                }

                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                await _auditLog.CreateAuditLogAsync("Approve", "Transfers", $"Approved and Completed Warehouse Transfer {header.TransactionNo}");

                var dto = _mapper.Map<TransferHeaderDto>(header);
                return GenericResponse<TransferHeaderDto>.Success(dto, "Transfer approved and inventory balances synchronized.");
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                return GenericResponse<TransferHeaderDto>.Failure("Failed to approve transfer. Details: " + ex.Message);
            }
        }

        public async Task<GenericResponse<TransferHeaderDto>> RejectTransferAsync(Guid id)
        {
            var header = await _context.TransferHeaders.FindAsync(id);
            if (header == null) return GenericResponse<TransferHeaderDto>.Failure("Transfer request not found.");
            if (header.Status != TransactionStatus.Draft) return GenericResponse<TransferHeaderDto>.Failure("Transfer is already processed.");

            header.Status = TransactionStatus.Rejected;
            header.ApprovedDate = DateTime.UtcNow;
            header.ApprovedBy = "Admin";
            _context.TransferHeaders.Update(header);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Reject", "Transfers", $"Rejected Warehouse Transfer {header.TransactionNo}");

            var dto = _mapper.Map<TransferHeaderDto>(header);
            return GenericResponse<TransferHeaderDto>.Success(dto, "Transfer request has been rejected.");
        }
        #endregion

        #region Helper Stock Alert check
        private async Task CheckAndTriggerLowStockAlert(Guid productId)
        {
            var totalStock = await _context.WarehouseStocks
                .Where(ws => ws.ProductId == productId)
                .SumAsync(ws => ws.CurrentStock);

            var product = await _context.Products.FindAsync(productId);
            if (product != null && totalStock <= product.ReorderLevel)
            {
                var message = $"Low Stock Warning: '{product.ProductName}' ({product.ProductCode}) stock level is down to {totalStock} (Reorder level is {product.ReorderLevel}).";
                await _notifications.CreateNotificationAsync(message, "LowStock", null);

                // Try sending email
                try
                {
                    var settings = await _context.CompanySettings.FirstOrDefaultAsync();
                    var companyName = settings?.CompanyName ?? "Invantage System";
                    var subject = $"Low Stock Alert - {product.ProductCode}";
                    var body = $"<h2>Low Stock Alert</h2><p>This is a system generated notification from {companyName}.</p><p>Product: <strong>{product.ProductName}</strong> ({product.ProductCode})</p><p>Available Stock: {totalStock}</p><p>Reorder Threshold: {product.ReorderLevel}</p><br/><p>Please arrange for restock.</p>";
                    
                    // Send alert to central administration
                    await _email.SendEmailAsync("admin@invantage.com", subject, body);
                }
                catch
                {
                    // Ignore email sender errors
                }
            }
        }
        #endregion
    }
}
