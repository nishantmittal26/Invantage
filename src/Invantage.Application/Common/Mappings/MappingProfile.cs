using AutoMapper;
using Invantage.Core.Entities;
using Invantage.Core.Entities.Identity;
using Invantage.Application.DTOs.Auth;
using Invantage.Application.DTOs.Security;
using Invantage.Application.DTOs.Masters;
using Invantage.Application.DTOs.Transactions;
using Invantage.Application.DTOs.Purchase;
using Invantage.Application.DTOs.Settings;
using System.Linq;

namespace Invantage.Application.Common.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Security Mappings
            CreateMap<ApplicationUser, UserDto>()
                .ForMember(dest => dest.Role, opt => opt.Ignore()); // Mapped manually in service since roles are dynamic

            CreateMap<ApplicationRole, RoleDto>()
                .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => src.RolePermissions));

            CreateMap<Permission, PermissionDto>();

            CreateMap<RolePermission, RolePermissionDto>()
                .ForMember(dest => dest.PermissionName, opt => opt.MapFrom(src => src.Permission.Name))
                .ForMember(dest => dest.Module, opt => opt.MapFrom(src => src.Permission.Module));

            CreateMap<RolePermissionDto, RolePermission>();

            // Master Mappings
            CreateMap<Category, CategoryDto>();
            CreateMap<CategoryUpsertDto, Category>();

            CreateMap<Brand, BrandDto>();
            CreateMap<BrandUpsertDto, Brand>();

            CreateMap<Unit, UnitDto>();
            CreateMap<UnitUpsertDto, Unit>();

            CreateMap<Supplier, SupplierDto>();
            CreateMap<SupplierUpsertDto, Supplier>();

            CreateMap<Warehouse, WarehouseDto>();
            CreateMap<WarehouseUpsertDto, Warehouse>();

            CreateMap<WarehouseStock, WarehouseStockDto>()
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.WarehouseName))
                .ForMember(dest => dest.ProductCode, opt => opt.MapFrom(src => src.Product.ProductCode))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.ProductName));

            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.CategoryName))
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Brand.BrandName))
                .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.Unit.UnitName))
                .ForMember(dest => dest.TotalStock, opt => opt.MapFrom(src => src.WarehouseStocks.Sum(ws => ws.CurrentStock)));

            CreateMap<ProductUpsertDto, Product>();

            // Transaction Mappings
            CreateMap<StockInHeader, StockInHeaderDto>()
                .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Supplier.SupplierName))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.WarehouseName))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Details, opt => opt.MapFrom(src => src.Details));

            CreateMap<StockInDetail, StockInDetailDto>()
                .ForMember(dest => dest.ProductCode, opt => opt.MapFrom(src => src.Product.ProductCode))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.ProductName));

            CreateMap<StockOutHeader, StockOutHeaderDto>()
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.WarehouseName))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Details, opt => opt.MapFrom(src => src.Details));

            CreateMap<StockOutDetail, StockOutDetailDto>()
                .ForMember(dest => dest.ProductCode, opt => opt.MapFrom(src => src.Product.ProductCode))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.ProductName));

            CreateMap<InventoryAdjustment, AdjustmentDto>()
                .ForMember(dest => dest.ProductCode, opt => opt.MapFrom(src => src.Product.ProductCode))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.ProductName))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.WarehouseName))
                .ForMember(dest => dest.Reason, opt => opt.MapFrom(src => src.Reason.ToString()));

            CreateMap<TransferHeader, TransferHeaderDto>()
                .ForMember(dest => dest.SourceWarehouseName, opt => opt.MapFrom(src => src.SourceWarehouse.WarehouseName))
                .ForMember(dest => dest.DestinationWarehouseName, opt => opt.MapFrom(src => src.DestinationWarehouse.WarehouseName))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Details, opt => opt.MapFrom(src => src.Details));

            CreateMap<TransferDetail, TransferDetailDto>()
                .ForMember(dest => dest.ProductCode, opt => opt.MapFrom(src => src.Product.ProductCode))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.ProductName));

            // Purchase Order Mappings
            CreateMap<PurchaseOrder, PurchaseOrderDto>()
                .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Supplier.SupplierName))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.WarehouseName))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Details, opt => opt.MapFrom(src => src.Details));

            CreateMap<PurchaseOrderDetail, PurchaseOrderDetailDto>()
                .ForMember(dest => dest.ProductCode, opt => opt.MapFrom(src => src.Product.ProductCode))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.ProductName));

            // Settings & System Mappings
            CreateMap<AuditLog, AuditLogDto>();

            CreateMap<Notification, NotificationDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));

            CreateMap<CompanySettings, CompanySettingsDto>().ReverseMap();
            CreateMap<CompanySettings, SmtpSettingsDto>().ReverseMap();
        }
    }
}
