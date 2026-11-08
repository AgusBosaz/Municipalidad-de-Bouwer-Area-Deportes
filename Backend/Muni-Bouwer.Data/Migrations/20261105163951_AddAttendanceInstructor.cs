using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Muni_Bouwer.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceInstructor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "InstructorId",
                table: "StudentAttendances",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentAttendances_InstructorId",
                table: "StudentAttendances",
                column: "InstructorId");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAttendances_Users_InstructorId",
                table: "StudentAttendances",
                column: "InstructorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StudentAttendances_Users_InstructorId",
                table: "StudentAttendances");

            migrationBuilder.DropIndex(
                name: "IX_StudentAttendances_InstructorId",
                table: "StudentAttendances");

            migrationBuilder.DropColumn(
                name: "InstructorId",
                table: "StudentAttendances");
        }
    }
}
