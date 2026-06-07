using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.Common.Models;
using Invantage.Application.DTOs.Purchase;
using Invantage.Core.Entities;
using Invantage.Core.Enums;

namespace Invantage.Application.Services
{
    public class PurchaseOrderService : IPurchaseOrderService
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ISettingsService _auditLog;
        private readonly INotificationService _notifications;
        private readonly IEmailService _email;

        public PurchaseOrderService(
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

        public async Task<GenericResponse<List<PurchaseOrderDto>>> GetPurchaseOrdersAsync()
        {
            var items = await _context.PurchaseOrders
                .Include(p => p.Supplier)
                .Include(p => p.Warehouse)
                .Include(p => p.Details)
                    .ThenInclude(d => d.Product)
                .ToListAsync();

            var dtos = _mapper.Map<List<PurchaseOrderDto>>(items);
            return GenericResponse<List<PurchaseOrderDto>>.Success(dtos);
        }

        public async Task<GenericResponse<PurchaseOrderDto>> GetPurchaseOrderByIdAsync(Guid id)
        {
            var item = await _context.PurchaseOrders
                .Include(p => p.Supplier)
                .Include(p => p.Warehouse)
                .Include(p => p.Details)
                    .ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (item == null) return GenericResponse<PurchaseOrderDto>.Failure("Purchase Order not found.");
            var dto = _mapper.Map<PurchaseOrderDto>(item);
            return GenericResponse<PurchaseOrderDto>.Success(dto);
        }

        public async Task<GenericResponse<PurchaseOrderDto>> CreatePurchaseOrderAsync(PurchaseOrderCreateDto request)
        {
            using var transaction = await _context.BeginTransactionAsync();
            try
            {
                var count = await _context.PurchaseOrders.CountAsync();
                var poNumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{count + 1:D4}";

                var po = new PurchaseOrder
                {
                    PONumber = poNumber,
                    Date = DateTime.UtcNow,
                    SupplierId = request.SupplierId,
                    WarehouseId = request.WarehouseId,
                    Status = TransactionStatus.Draft
                };

                foreach (var detail in request.Details)
                {
                    po.Details.Add(new PurchaseOrderDetail
                    {
                        ProductId = detail.ProductId,
                        Quantity = detail.Quantity,
                        Rate = detail.Rate
                    });
                }

                await _context.PurchaseOrders.AddAsync(po);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _auditLog.CreateAuditLogAsync("Add", "PurchaseOrders", $"Created Purchase Order draft {poNumber}");

                var dto = _mapper.Map<PurchaseOrderDto>(po);
                return GenericResponse<PurchaseOrderDto>.Success(dto, "Purchase Order draft created successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return GenericResponse<PurchaseOrderDto>.Failure("Failed to create Purchase Order. Details: " + ex.Message);
            }
        }

        public async Task<GenericResponse<PurchaseOrderDto>> ApprovePurchaseOrderAsync(Guid id)
        {
            var po = await _context.PurchaseOrders.FindAsync(id);
            if (po == null) return GenericResponse<PurchaseOrderDto>.Failure("Purchase Order not found.");
            if (po.Status != TransactionStatus.Draft) return GenericResponse<PurchaseOrderDto>.Failure("Only Draft Purchase Orders can be approved.");

            po.Status = TransactionStatus.Approved;
            po.ApprovedDate = DateTime.UtcNow;
            po.ApprovedBy = "Admin";

            _context.PurchaseOrders.Update(po);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Approve", "PurchaseOrders", $"Approved Purchase Order {po.PONumber}");

            var fullPo = await _context.PurchaseOrders
                .Include(p => p.Supplier)
                .Include(p => p.Warehouse)
                .Include(p => p.Details)
                    .ThenInclude(d => d.Product)
                .FirstAsync(p => p.Id == id);

            var dto = _mapper.Map<PurchaseOrderDto>(fullPo);
            return GenericResponse<PurchaseOrderDto>.Success(dto, "Purchase Order approved.");
        }

        public async Task<GenericResponse<PurchaseOrderDto>> ReceivePurchaseOrderAsync(Guid id)
        {
            var po = await _context.PurchaseOrders
                .Include(p => p.Details)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (po == null) return GenericResponse<PurchaseOrderDto>.Failure("Purchase Order not found.");
            if (po.Status != TransactionStatus.Approved) return GenericResponse<PurchaseOrderDto>.Failure("Only Approved Purchase Orders can be received.");

            using var dbTransaction = await _context.BeginTransactionAsync();
            try
            {
                po.Status = TransactionStatus.Received;
                _context.PurchaseOrders.Update(po);

                // Auto-generate an approved Stock In transaction
                var stockInCount = await _context.StockInHeaders.CountAsync();
                var stockInNo = $"STK-IN-{DateTime.UtcNow:yyyyMMdd}-{stockInCount + 1:D4}";

                var stockInHeader = new StockInHeader
                {
                    TransactionNo = stockInNo,
                    Date = DateTime.UtcNow,
                    SupplierId = po.SupplierId,
                    WarehouseId = po.WarehouseId,
                    Status = TransactionStatus.Approved, // Auto-approve
                    ApprovedBy = "Admin",
                    ApprovedDate = DateTime.UtcNow
                };

                foreach (var poItem in po.Details)
                {
                    stockInHeader.Details.Add(new StockInDetail
                    {
                        ProductId = poItem.ProductId,
                        Quantity = poItem.Quantity,
                        CostPrice = poItem.Rate,
                        BatchNumber = $"PO-BATCH-{po.PONumber.Split('-').Last()}",
                        ExpiryDate = DateTime.UtcNow.AddYears(1) // Seed mock expiry 1 year from now
                    });

                    // Update stock
                    var stock = await _context.WarehouseStocks
                        .FirstOrDefaultAsync(ws => ws.WarehouseId == po.WarehouseId && ws.ProductId == poItem.ProductId);

                    if (stock == null)
                    {
                        stock = new WarehouseStock
                        {
                            WarehouseId = po.WarehouseId,
                            ProductId = poItem.ProductId,
                            CurrentStock = poItem.Quantity,
                            LastUpdated = DateTime.UtcNow
                        };
                        await _context.WarehouseStocks.AddAsync(stock);
                    }
                    else
                    {
                        stock.CurrentStock += poItem.Quantity;
                        stock.LastUpdated = DateTime.UtcNow;
                        _context.WarehouseStocks.Update(stock);
                    }
                }

                await _context.StockInHeaders.AddAsync(stockInHeader);
                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                await _auditLog.CreateAuditLogAsync("Approve", "PurchaseOrders", $"Received stock for Purchase Order {po.PONumber}. Generated Stock In {stockInNo}");

                var fullPo = await _context.PurchaseOrders
                    .Include(p => p.Supplier)
                    .Include(p => p.Warehouse)
                    .Include(p => p.Details)
                        .ThenInclude(d => d.Product)
                    .FirstAsync(p => p.Id == id);

                var dto = _mapper.Map<PurchaseOrderDto>(fullPo);
                return GenericResponse<PurchaseOrderDto>.Success(dto, "Purchase Order received and stock created.");
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                return GenericResponse<PurchaseOrderDto>.Failure("Failed to receive Purchase Order. Details: " + ex.Message);
            }
        }

        public async Task<GenericResponse<PurchaseOrderDto>> RejectPurchaseOrderAsync(Guid id)
        {
            var po = await _context.PurchaseOrders.FindAsync(id);
            if (po == null) return GenericResponse<PurchaseOrderDto>.Failure("Purchase Order not found.");
            if (po.Status != TransactionStatus.Draft) return GenericResponse<PurchaseOrderDto>.Failure("Only Draft Purchase Orders can be rejected.");

            po.Status = TransactionStatus.Rejected;
            _context.PurchaseOrders.Update(po);
            await _context.SaveChangesAsync();

            await _auditLog.CreateAuditLogAsync("Reject", "PurchaseOrders", $"Rejected Purchase Order {po.PONumber}");

            var fullPo = await _context.PurchaseOrders
                .Include(p => p.Supplier)
                .Include(p => p.Warehouse)
                .Include(p => p.Details)
                    .ThenInclude(d => d.Product)
                .FirstAsync(p => p.Id == id);

            var dto = _mapper.Map<PurchaseOrderDto>(fullPo);
            return GenericResponse<PurchaseOrderDto>.Success(dto, "Purchase Order rejected.");
        }
    }
}
