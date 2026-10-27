using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Muni_Bouwer.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddInstructorActivityIsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "InstructorActivities",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "InstructorActivities");
        }
    }
}
