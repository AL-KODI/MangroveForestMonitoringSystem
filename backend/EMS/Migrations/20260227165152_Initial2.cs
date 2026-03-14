using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EMS.Migrations
{
    /// <inheritdoc />
    public partial class Initial2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UnitProperties_UnitId",
                table: "UnitProperties");

            migrationBuilder.CreateIndex(
                name: "IX_UnitProperties_UnitId_PropertyId",
                table: "UnitProperties",
                columns: new[] { "UnitId", "PropertyId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UnitProperties_UnitId_PropertyId",
                table: "UnitProperties");

            migrationBuilder.CreateIndex(
                name: "IX_UnitProperties_UnitId",
                table: "UnitProperties",
                column: "UnitId");
        }
    }
}
