using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Muni_Bouwer.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityDaysAndLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Days",
                table: "Activities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Days",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Activities");
        }
    }
}
