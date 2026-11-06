using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Muni_Bouwer.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMedicalRecordPdf : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MedicalRecordPdfs",
                columns: table => new
                {
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalRecordPdfs", x => x.StudentId);
                    table.ForeignKey(
                        name: "FK_MedicalRecordPdfs_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MedicalRecordPdfs");
        }
    }
}
