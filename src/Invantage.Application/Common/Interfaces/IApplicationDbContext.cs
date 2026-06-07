using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.AspNetCore.Identity;
using Invantage.Core.Entities;
using Invantage.Core.Entities.Identity;

namespace Invantage.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<IdentityUserRole<Guid>> UserRoles { get; }
        DbSet<Category> Categories { get; }
        DbSet<Brand> Brands { get; }
        DbSet<Unit> Units { get; }
        DbSet<Supplier> Suppliers { get; }
        DbSet<Warehouse> Warehouses { get; }
        DbSet<WarehouseStock> WarehouseStocks { get; }
        DbSet<Product> Products { get; }

        DbSet<StockInHeader> StockInHeaders { get; }
        DbSet<StockInDetail> StockInDetails { get; }
        DbSet<StockOutHeader> StockOutHeaders { get; }
        DbSet<StockOutDetail> StockOutDetails { get; }
        DbSet<InventoryAdjustment> InventoryAdjustments { get; }
        DbSet<TransferHeader> TransferHeaders { get; }
        DbSet<TransferDetail> TransferDetails { get; }
        DbSet<PurchaseOrder> PurchaseOrders { get; }
        DbSet<PurchaseOrderDetail> PurchaseOrderDetails { get; }

        DbSet<AuditLog> AuditLogs { get; }
        DbSet<Notification> Notifications { get; }
        DbSet<CompanySettings> CompanySettings { get; }
        DbSet<RefreshToken> RefreshTokens { get; }
        DbSet<Permission> Permissions { get; }
        DbSet<RolePermission> RolePermissions { get; }
        DbSet<ApplicationUser> Users { get; }
        DbSet<ApplicationRole> Roles { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    }
}
