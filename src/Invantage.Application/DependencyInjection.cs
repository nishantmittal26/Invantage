using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using Invantage.Application.Common.Interfaces;
using Invantage.Application.Common.Mappings;
using Invantage.Application.Services;

namespace Invantage.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddAutoMapper(cfg => cfg.AddMaps(Assembly.GetExecutingAssembly()));
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IRoleService, RoleService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IMasterServices, MasterServices>();
            services.AddScoped<ITransactionService, TransactionService>();
            services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<ISettingsService, SettingsService>();

            return services;
        }
    }
}
