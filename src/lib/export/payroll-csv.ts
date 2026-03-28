import type { HolidayRequest, Employee } from "@/types/database";
import { format, parseISO } from "date-fns";

export function generatePayrollCSV(
  requests: (HolidayRequest & { employee?: Pick<Employee, "first_name" | "last_name" | "email"> })[],
): string {
  const headers = [
    "Employee Name",
    "Email",
    "Start Date",
    "End Date",
    "Days",
    "Leave Type",
    "Status",
    "Created",
  ];

  const rows = requests.map((r) => [
    `${r.employee?.first_name || ""} ${r.employee?.last_name || ""}`.trim(),
    r.employee?.email || "",
    format(parseISO(r.start_date), "dd/MM/yyyy"),
    format(parseISO(r.end_date), "dd/MM/yyyy"),
    r.amount.toString(),
    r.leave_type,
    r.status,
    format(parseISO(r.created_at), "dd/MM/yyyy"),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}
