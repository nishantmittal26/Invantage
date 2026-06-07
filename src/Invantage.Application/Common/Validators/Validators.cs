using FluentValidation;
using Invantage.Application.DTOs.Auth;
using Invantage.Application.DTOs.Security;
using Invantage.Application.DTOs.Masters;
using Invantage.Application.DTOs.Transactions;
using Invantage.Application.DTOs.Purchase;

namespace Invantage.Application.Common.Validators
{
    public class LoginRequestValidator : AbstractValidator<LoginRequest>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("A valid email address is required.");
            RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
        }
    }

    public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
    {
        public CreateUserRequestValidator()
        {
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Mobile).NotEmpty().Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid mobile number format.");
            RuleFor(x => x.UserName).NotEmpty().MinimumLength(3).MaximumLength(50);
            RuleFor(x => x.Password).NotEmpty().MinimumLength(6).WithMessage("Password must be at least 6 characters.");
            RuleFor(x => x.Role).NotEmpty().WithMessage("A user role must be selected.");
        }
    }

    public class ProductUpsertDtoValidator : AbstractValidator<ProductUpsertDto>
    {
        public ProductUpsertDtoValidator()
        {
            RuleFor(x => x.ProductCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.SKU).NotEmpty().MaximumLength(50);
            RuleFor(x => x.ProductName).NotEmpty().MaximumLength(150);
            RuleFor(x => x.CategoryId).NotEmpty().WithMessage("Category is required.");
            RuleFor(x => x.BrandId).NotEmpty().WithMessage("Brand is required.");
            RuleFor(x => x.UnitId).NotEmpty().WithMessage("Unit of measure is required.");
            RuleFor(x => x.ReorderLevel).GreaterThanOrEqualTo(0);
            RuleFor(x => x.MinimumStock).GreaterThanOrEqualTo(0);
            RuleFor(x => x.MaximumStock).GreaterThan(x => x.MinimumStock).WithMessage("Maximum stock must be greater than minimum stock.");
            RuleFor(x => x.CostPrice).GreaterThan(0).WithMessage("Cost price must be greater than 0.");
            RuleFor(x => x.SellingPrice).GreaterThanOrEqualTo(x => x.CostPrice).WithMessage("Selling price cannot be less than cost price.");
        }
    }

    public class CategoryUpsertDtoValidator : AbstractValidator<CategoryUpsertDto>
    {
        public CategoryUpsertDtoValidator()
        {
            RuleFor(x => x.CategoryName).NotEmpty().MaximumLength(100);
        }
    }

    public class SupplierUpsertDtoValidator : AbstractValidator<SupplierUpsertDto>
    {
        public SupplierUpsertDtoValidator()
        {
            RuleFor(x => x.SupplierName).NotEmpty().MaximumLength(150);
            RuleFor(x => x.ContactPerson).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Mobile).NotEmpty().Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid mobile number.");
            RuleFor(x => x.GSTNumber).NotEmpty().MaximumLength(15).WithMessage("GST number is required.");
        }
    }

    public class WarehouseUpsertDtoValidator : AbstractValidator<WarehouseUpsertDto>
    {
        public WarehouseUpsertDtoValidator()
        {
            RuleFor(x => x.WarehouseCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.WarehouseName).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Manager).NotEmpty().MaximumLength(100);
        }
    }

    public class StockInCreateDtoValidator : AbstractValidator<StockInCreateDto>
    {
        public StockInCreateDtoValidator()
        {
            RuleFor(x => x.SupplierId).NotEmpty();
            RuleFor(x => x.WarehouseId).NotEmpty();
            RuleFor(x => x.Details).NotEmpty().WithMessage("At least one product detail item is required.");
            RuleForEach(x => x.Details).SetValidator(new StockInDetailCreateDtoValidator());
        }
    }

    public class StockInDetailCreateDtoValidator : AbstractValidator<StockInDetailCreateDto>
    {
        public StockInDetailCreateDtoValidator()
        {
            RuleFor(x => x.ProductId).NotEmpty();
            RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than 0.");
            RuleFor(x => x.CostPrice).GreaterThanOrEqualTo(0).WithMessage("Cost price must be positive.");
        }
    }

    public class StockOutCreateDtoValidator : AbstractValidator<StockOutCreateDto>
    {
        public StockOutCreateDtoValidator()
        {
            RuleFor(x => x.WarehouseId).NotEmpty();
            RuleFor(x => x.DepartmentOrUser).NotEmpty().WithMessage("Issuing Department or User is required.");
            RuleFor(x => x.Details).NotEmpty().WithMessage("At least one product item is required.");
            RuleForEach(x => x.Details).SetValidator(new StockOutDetailCreateDtoValidator());
        }
    }

    public class StockOutDetailCreateDtoValidator : AbstractValidator<StockOutDetailCreateDto>
    {
        public StockOutDetailCreateDtoValidator()
        {
            RuleFor(x => x.ProductId).NotEmpty();
            RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than 0.");
        }
    }

    public class AdjustmentCreateDtoValidator : AbstractValidator<AdjustmentCreateDto>
    {
        public AdjustmentCreateDtoValidator()
        {
            RuleFor(x => x.ProductId).NotEmpty();
            RuleFor(x => x.WarehouseId).NotEmpty();
            RuleFor(x => x.AdjustQuantity).NotEqual(0).WithMessage("Adjust quantity cannot be 0.");
        }
    }

    public class TransferCreateDtoValidator : AbstractValidator<TransferCreateDto>
    {
        public TransferCreateDtoValidator()
        {
            RuleFor(x => x.SourceWarehouseId).NotEmpty();
            RuleFor(x => x.DestinationWarehouseId).NotEmpty()
                .NotEqual(x => x.SourceWarehouseId).WithMessage("Source and destination warehouses cannot be the same.");
            RuleFor(x => x.Details).NotEmpty().WithMessage("At least one transfer item is required.");
            RuleForEach(x => x.Details).SetValidator(new TransferDetailCreateDtoValidator());
        }
    }

    public class TransferDetailCreateDtoValidator : AbstractValidator<TransferDetailCreateDto>
    {
        public TransferDetailCreateDtoValidator()
        {
            RuleFor(x => x.ProductId).NotEmpty();
            RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than 0.");
        }
    }

    public class PurchaseOrderCreateDtoValidator : AbstractValidator<PurchaseOrderCreateDto>
    {
        public PurchaseOrderCreateDtoValidator()
        {
            RuleFor(x => x.SupplierId).NotEmpty();
            RuleFor(x => x.WarehouseId).NotEmpty();
            RuleFor(x => x.Details).NotEmpty().WithMessage("At least one purchase item is required.");
            RuleForEach(x => x.Details).SetValidator(new PurchaseOrderDetailCreateDtoValidator());
        }
    }

    public class PurchaseOrderDetailCreateDtoValidator : AbstractValidator<PurchaseOrderDetailCreateDto>
    {
        public PurchaseOrderDetailCreateDtoValidator()
        {
            RuleFor(x => x.ProductId).NotEmpty();
            RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than 0.");
            RuleFor(x => x.Rate).GreaterThan(0).WithMessage("Rate must be greater than 0.");
        }
    }
}
