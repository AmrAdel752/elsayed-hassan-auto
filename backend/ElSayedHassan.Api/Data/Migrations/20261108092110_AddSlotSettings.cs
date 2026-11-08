using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ElSayedHassan.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSlotSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClosedDays",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClosedDays", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClosedSlots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Hour = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClosedSlots", x => x.Id);
                    table.CheckConstraint("CK_ClosedSlots_Hour", "[Hour] BETWEEN 0 AND 23");
                });

            migrationBuilder.CreateTable(
                name: "SlotSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    OpenHour = table.Column<int>(type: "int", nullable: false),
                    CloseHour = table.Column<int>(type: "int", nullable: false),
                    MaxDaysAhead = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SlotSettings", x => x.Id);
                    table.CheckConstraint("CK_SlotSettings_Capacity", "[Capacity] BETWEEN 0 AND 50");
                    table.CheckConstraint("CK_SlotSettings_Hours", "[OpenHour] >= 0 AND [CloseHour] <= 24 AND [OpenHour] < [CloseHour]");
                });

            migrationBuilder.InsertData(
                table: "SlotSettings",
                columns: new[] { "Id", "Capacity", "CloseHour", "CreatedAt", "MaxDaysAhead", "OpenHour" },
                values: new object[] { 1, 3, 22, new DateTime(2026, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), 30, 10 });

            migrationBuilder.CreateIndex(
                name: "IX_ClosedDays_Date",
                table: "ClosedDays",
                column: "Date",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClosedSlots_Date_Hour",
                table: "ClosedSlots",
                columns: new[] { "Date", "Hour" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClosedDays");

            migrationBuilder.DropTable(
                name: "ClosedSlots");

            migrationBuilder.DropTable(
                name: "SlotSettings");
        }
    }
}
