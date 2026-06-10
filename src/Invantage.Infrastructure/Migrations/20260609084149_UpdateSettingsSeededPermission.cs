using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Invantage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSettingsSeededPermission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("22222222-caca-caca-caca-222222222226"),
                column: "View",
                value: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("22222222-caca-caca-caca-222222222226"),
                column: "View",
                value: true);
        }
    }
}
