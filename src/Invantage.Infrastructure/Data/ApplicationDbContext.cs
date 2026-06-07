using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Invantage.Core.Entities;
using Invantage.Core.Entities.Identity;
using Invantage.Core.Enums;
using Invantage.Application.Common.Interfaces;

namespace Invantage.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Brand> Brands { get; set; } = null!;
        public DbSet<Unit> Units { get; set; } = null!;
        public DbSet<Supplier> Suppliers { get; set; } = null!;
        public DbSet<Warehouse> Warehouses { get; set; } = null!;
        public DbSet<WarehouseStock> WarehouseStocks { get; set; } = null!;
        public DbSet<Product> Products { get; set; } = null!;

        public DbSet<StockInHeader> StockInHeaders { get; set; } = null!;
        public DbSet<StockInDetail> StockInDetails { get; set; } = null!;
        public DbSet<StockOutHeader> StockOutHeaders { get; set; } = null!;
        public DbSet<StockOutDetail> StockOutDetails { get; set; } = null!;
        public DbSet<InventoryAdjustment> InventoryAdjustments { get; set; } = null!;
        public DbSet<TransferHeader> TransferHeaders { get; set; } = null!;
        public DbSet<TransferDetail> TransferDetails { get; set; } = null!;
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; } = null!;
        public DbSet<PurchaseOrderDetail> PurchaseOrderDetails { get; set; } = null!;

        public DbSet<AuditLog> AuditLogs { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<CompanySettings> CompanySettings { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<Permission> Permissions { get; set; } = null!;
        public DbSet<RolePermission> RolePermissions { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure Entity relationship names to match user requirements
            builder.Entity<ApplicationUser>(entity => { entity.ToTable("Users"); });
            builder.Entity<ApplicationRole>(entity => { entity.ToTable("Roles"); });
            builder.Entity<IdentityUserRole<Guid>>(entity => { entity.ToTable("UserRoles"); });
            builder.Entity<IdentityUserClaim<Guid>>(entity => { entity.ToTable("UserClaims"); });
            builder.Entity<IdentityUserLogin<Guid>>(entity => { entity.ToTable("UserLogins"); });
            builder.Entity<IdentityRoleClaim<Guid>>(entity => { entity.ToTable("RoleClaims"); });
            builder.Entity<IdentityUserToken<Guid>>(entity => { entity.ToTable("UserTokens"); });

            // Configure Decimal precision
            builder.Entity<Product>()
                .Property(p => p.CostPrice)
                .HasPrecision(18, 2);

            builder.Entity<Product>()
                .Property(p => p.SellingPrice)
                .HasPrecision(18, 2);

            builder.Entity<StockInDetail>()
                .Property(d => d.CostPrice)
                .HasPrecision(18, 2);

            builder.Entity<PurchaseOrderDetail>()
                .Property(d => d.Rate)
                .HasPrecision(18, 2);

            // Configure Delete Behaviors to avoid Multiple Cascade Paths in SQL Server
            builder.Entity<TransferHeader>()
                .HasOne(t => t.SourceWarehouse)
                .WithMany()
                .HasForeignKey(t => t.SourceWarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<TransferHeader>()
                .HasOne(t => t.DestinationWarehouse)
                .WithMany()
                .HasForeignKey(t => t.DestinationWarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<StockInHeader>()
                .HasOne(s => s.Warehouse)
                .WithMany()
                .HasForeignKey(s => s.WarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<StockInHeader>()
                .HasOne(s => s.Supplier)
                .WithMany()
                .HasForeignKey(s => s.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<StockOutHeader>()
                .HasOne(s => s.Warehouse)
                .WithMany()
                .HasForeignKey(s => s.WarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<PurchaseOrder>()
                .HasOne(p => p.Supplier)
                .WithMany(s => s.PurchaseOrders)
                .HasForeignKey(p => p.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<PurchaseOrder>()
                .HasOne(p => p.Warehouse)
                .WithMany()
                .HasForeignKey(p => p.WarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<WarehouseStock>()
                .HasIndex(ws => new { ws.WarehouseId, ws.ProductId })
                .IsUnique();

            // Seed Roles
            var adminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var managerRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var storeUserRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");

            builder.Entity<ApplicationRole>().HasData(
                new ApplicationRole { Id = adminRoleId, Name = "MasterAdmin", NormalizedName = "MASTERADMIN", Description = "Full access to everything", ConcurrencyStamp = "11111111-1111-1111-1111-111111111111" },
                new ApplicationRole { Id = managerRoleId, Name = "InventoryManager", NormalizedName = "INVENTORYMANAGER", Description = "Can manage products and inventory transactions", ConcurrencyStamp = "22222222-2222-2222-2222-222222222222" },
                new ApplicationRole { Id = storeUserRoleId, Name = "StoreUser", NormalizedName = "STOREUSER", Description = "Can view inventory and request stock", ConcurrencyStamp = "33333333-3333-3333-3333-333333333333" }
            );

            // Seed User
            var adminUserId = Guid.Parse("99999999-9999-9999-9999-999999999999");
            var adminUser = new ApplicationUser
            {
                Id = adminUserId,
                UserName = "admin@invantage.com",
                NormalizedUserName = "ADMIN@INVANTAGE.COM",
                Email = "admin@invantage.com",
                NormalizedEmail = "ADMIN@INVANTAGE.COM",
                EmailConfirmed = true,
                FirstName = "Master",
                LastName = "Admin",
                Mobile = "9876543210",
                PhoneNumber = "9876543210",
                Status = "Active",
                SecurityStamp = "00000000-0000-0000-0000-000000000000",
                ConcurrencyStamp = "99999999-9999-9999-9999-999999999999",
                PasswordHash = "AQAAAAIAAYagAAAAEBX4Z38Q7PgiR4rLxhseN4+E4J7SaXu5WYiAzmSpsNqqXf5njQRA8ssL0xSFlkP0pQ=="
            };

            builder.Entity<ApplicationUser>().HasData(adminUser);

            // Assign User to Role
            builder.Entity<IdentityUserRole<Guid>>().HasData(
                new IdentityUserRole<Guid> { UserId = adminUserId, RoleId = adminRoleId }
            );

            // Seed Permissions
            var permProductsId = Guid.Parse("a1111111-1111-1111-1111-111111111111");
            var permInventoryId = Guid.Parse("a2222222-2222-2222-2222-222222222222");
            var permUsersId = Guid.Parse("a3333333-3333-3333-3333-333333333333");
            var permDashboardId = Guid.Parse("a4444444-4444-4444-4444-444444444444");
            var permReportsId = Guid.Parse("a5555555-5555-5555-5555-555555555555");
            var permSettingsId = Guid.Parse("a6666666-6666-6666-6666-666666666666");

            builder.Entity<Permission>().HasData(
                new Permission { Id = permProductsId, Name = "Products", Module = "Products" },
                new Permission { Id = permInventoryId, Name = "Inventory", Module = "Inventory" },
                new Permission { Id = permUsersId, Name = "Users", Module = "Users" },
                new Permission { Id = permDashboardId, Name = "Dashboard", Module = "Dashboard" },
                new Permission { Id = permReportsId, Name = "Reports", Module = "Reports" },
                new Permission { Id = permSettingsId, Name = "Settings", Module = "Settings" }
            );

            // Seed Role Permissions for MasterAdmin (All true)
            builder.Entity<RolePermission>().HasData(
                new RolePermission { Id = Guid.Parse("11111111-caca-caca-caca-111111111111"), RoleId = adminRoleId, PermissionId = permProductsId, View = true, Add = true, Edit = true, Delete = true },
                new RolePermission { Id = Guid.Parse("11111111-caca-caca-caca-111111111112"), RoleId = adminRoleId, PermissionId = permInventoryId, View = true, Add = true, Edit = true, Delete = true },
                new RolePermission { Id = Guid.Parse("11111111-caca-caca-caca-111111111113"), RoleId = adminRoleId, PermissionId = permUsersId, View = true, Add = true, Edit = true, Delete = true },
                new RolePermission { Id = Guid.Parse("11111111-caca-caca-caca-111111111114"), RoleId = adminRoleId, PermissionId = permDashboardId, View = true, Add = true, Edit = true, Delete = true },
                new RolePermission { Id = Guid.Parse("11111111-caca-caca-caca-111111111115"), RoleId = adminRoleId, PermissionId = permReportsId, View = true, Add = true, Edit = true, Delete = true },
                new RolePermission { Id = Guid.Parse("11111111-caca-caca-caca-111111111116"), RoleId = adminRoleId, PermissionId = permSettingsId, View = true, Add = true, Edit = true, Delete = true }
            );

            // Seed Role Permissions for InventoryManager
            builder.Entity<RolePermission>().HasData(
                new RolePermission { Id = Guid.Parse("22222222-caca-caca-caca-222222222221"), RoleId = managerRoleId, PermissionId = permProductsId, View = true, Add = true, Edit = true, Delete = true },
                new RolePermission { Id = Guid.Parse("22222222-caca-caca-caca-222222222222"), RoleId = managerRoleId, PermissionId = permInventoryId, View = true, Add = true, Edit = true, Delete = true },
                new RolePermission { Id = Guid.Parse("22222222-caca-caca-caca-222222222223"), RoleId = managerRoleId, PermissionId = permUsersId, View = false, Add = false, Edit = false, Delete = false },
                new RolePermission { Id = Guid.Parse("22222222-caca-caca-caca-222222222224"), RoleId = managerRoleId, PermissionId = permDashboardId, View = true, Add = true, Edit = true, Delete = true },
                new RolePermission { Id = Guid.Parse("22222222-caca-caca-caca-222222222225"), RoleId = managerRoleId, PermissionId = permReportsId, View = true, Add = true, Edit = true, Delete = true },
                new RolePermission { Id = Guid.Parse("22222222-caca-caca-caca-222222222226"), RoleId = managerRoleId, PermissionId = permSettingsId, View = true, Add = false, Edit = false, Delete = false }
            );

            // Seed Role Permissions for StoreUser
            builder.Entity<RolePermission>().HasData(
                new RolePermission { Id = Guid.Parse("33333333-caca-caca-caca-333333333331"), RoleId = storeUserRoleId, PermissionId = permProductsId, View = true, Add = false, Edit = false, Delete = false },
                new RolePermission { Id = Guid.Parse("33333333-caca-caca-caca-333333333332"), RoleId = storeUserRoleId, PermissionId = permInventoryId, View = true, Add = true, Edit = false, Delete = false },
                new RolePermission { Id = Guid.Parse("33333333-caca-caca-caca-333333333333"), RoleId = storeUserRoleId, PermissionId = permUsersId, View = false, Add = false, Edit = false, Delete = false },
                new RolePermission { Id = Guid.Parse("33333333-caca-caca-caca-333333333334"), RoleId = storeUserRoleId, PermissionId = permDashboardId, View = true, Add = false, Edit = false, Delete = false },
                new RolePermission { Id = Guid.Parse("33333333-caca-caca-caca-333333333335"), RoleId = storeUserRoleId, PermissionId = permReportsId, View = false, Add = false, Edit = false, Delete = false },
                new RolePermission { Id = Guid.Parse("33333333-caca-caca-caca-333333333336"), RoleId = storeUserRoleId, PermissionId = permSettingsId, View = false, Add = false, Edit = false, Delete = false }
            );

            // Seed Initial Master Data for clean application start
            var catElectronicsId = Guid.Parse("c1111111-1111-1111-1111-111111111111");
            var catHardwareId = Guid.Parse("c2222222-2222-2222-2222-222222222222");
            var catStationeryId = Guid.Parse("c3333333-3333-3333-3333-333333333333");

            builder.Entity<Category>().HasData(
                new Category { Id = catElectronicsId, CategoryName = "Electronics", Description = "Electronic devices and accessories" },
                new Category { Id = catHardwareId, CategoryName = "Hardware", Description = "Hardware tools and components" },
                new Category { Id = catStationeryId, CategoryName = "Stationery", Description = "Office supplies and stationery" }
            );

            var brandLogitechId = Guid.Parse("b1111111-1111-1111-1111-111111111111");
            var brandDellId = Guid.Parse("b2222222-2222-2222-2222-222222222222");
            var brandGenericId = Guid.Parse("b3333333-3333-3333-3333-333333333333");

            builder.Entity<Brand>().HasData(
                new Brand { Id = brandLogitechId, BrandName = "Logitech", Description = "Computer peripherals" },
                new Brand { Id = brandDellId, BrandName = "Dell", Description = "Computers and hardware" },
                new Brand { Id = brandGenericId, BrandName = "Generic", Description = "Non-branded items" }
            );

            var unitPieceId = Guid.Parse("e1111111-1111-1111-1111-111111111111");
            var unitBoxId = Guid.Parse("e2222222-2222-2222-2222-222222222222");
            var unitKgId = Guid.Parse("e3333333-3333-3333-3333-333333333333");

            builder.Entity<Unit>().HasData(
                new Unit { Id = unitPieceId, UnitName = "Piece" },
                new Unit { Id = unitBoxId, UnitName = "Box" },
                new Unit { Id = unitKgId, UnitName = "Kg" }
            );

            var supGlobalId = Guid.Parse("f1111111-1111-1111-1111-111111111111");
            builder.Entity<Supplier>().HasData(
                new Supplier
                {
                    Id = supGlobalId,
                    SupplierName = "Global Tech Distributors",
                    ContactPerson = "John Doe",
                    Email = "john@globaltech.com",
                    Mobile = "9888877777",
                    GSTNumber = "29AAAAA1111A1Z1",
                    Address = "123 Technology Park, Electronic City",
                    City = "Bengaluru",
                    State = "Karnataka",
                    Country = "India"
                }
            );

            var whMainId = Guid.Parse("01111111-1111-1111-1111-111111111111");
            var whTransitId = Guid.Parse("02222222-2222-2222-2222-222222222222");

            builder.Entity<Warehouse>().HasData(
                new Warehouse { Id = whMainId, WarehouseCode = "WH-MAIN", WarehouseName = "Main Central Warehouse", Address = "Gate 1, Industrial Area", Manager = "Jane Smith" },
                new Warehouse { Id = whTransitId, WarehouseCode = "WH-TRANS", WarehouseName = "Transit Warehouse", Address = "Terminal 2, Logistics hub", Manager = "Robert Lee" }
            );

            var prodMouseId = Guid.Parse("51111111-1111-1111-1111-111111111111");
            var prodMonitorId = Guid.Parse("52222222-2222-2222-2222-222222222222");

            builder.Entity<Product>().HasData(
                new Product
                {
                    Id = prodMouseId,
                    ProductCode = "PROD-MX2S",
                    SKU = "LOGI-MX-MASTER-2S",
                    ProductName = "Logitech MX Master 2S",
                    Description = "Premium wireless productivity mouse",
                    CategoryId = catElectronicsId,
                    BrandId = brandLogitechId,
                    UnitId = unitPieceId,
                    ReorderLevel = 10,
                    MinimumStock = 5,
                    MaximumStock = 100,
                    CostPrice = 4500.00m,
                    SellingPrice = 5999.00m,
                    Barcode = "097855135117",
                    ImageUrl = null
                },
                new Product
                {
                    Id = prodMonitorId,
                    ProductCode = "PROD-U2419",
                    SKU = "DELL-U2419H",
                    ProductName = "Dell UltraSharp U2419H",
                    Description = "24-inch IPS Full HD monitor with thin bezel",
                    CategoryId = catElectronicsId,
                    BrandId = brandDellId,
                    UnitId = unitPieceId,
                    ReorderLevel = 5,
                    MinimumStock = 2,
                    MaximumStock = 30,
                    CostPrice = 14500.00m,
                    SellingPrice = 18999.00m,
                    Barcode = "884116315803",
                    ImageUrl = null
                }
            );

            // Seed initial warehouse stocks
            builder.Entity<WarehouseStock>().HasData(
                new WarehouseStock { Id = Guid.Parse("44444444-caca-caca-caca-444444444441"), WarehouseId = whMainId, ProductId = prodMouseId, CurrentStock = 25, LastUpdated = new DateTime(2026, 6, 6, 0, 0, 0, DateTimeKind.Utc) },
                new WarehouseStock { Id = Guid.Parse("44444444-caca-caca-caca-444444444442"), WarehouseId = whMainId, ProductId = prodMonitorId, CurrentStock = 8, LastUpdated = new DateTime(2026, 6, 6, 0, 0, 0, DateTimeKind.Utc) }
            );

            // Seed default company settings
            builder.Entity<CompanySettings>().HasData(
                new CompanySettings
                {
                    Id = Guid.Parse("d1111111-1111-1111-1111-111111111111"),
                    CompanyName = "Invantage Enterprise Solutions",
                    Address = "HQ Building, 4th Floor, Tech Hub",
                    GSTNumber = "29AAAAA1111A1Z1",
                    Logo = null,
                    SmtpHost = "smtp.mailtrap.io",
                    SmtpPort = 587,
                    SmtpEmail = "notifications@invantage.com",
                    SmtpPassword = "",
                    EnableSmtp = false
                }
            );
        }

        public override async Task<int> SaveChangesAsync(System.Threading.CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                        entry.Entity.CreatedBy ??= "System";
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = DateTime.UtcNow;
                        entry.Entity.UpdatedBy ??= "System";
                        break;
                }
            }

            foreach (var entry in ChangeTracker.Entries<ApplicationUser>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedDate = DateTime.UtcNow;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync(System.Threading.CancellationToken cancellationToken = default)
        {
            return await Database.BeginTransactionAsync(cancellationToken);
        }
    }
}
