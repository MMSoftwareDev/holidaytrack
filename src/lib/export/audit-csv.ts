import type { AuditLogEntry } from "@/types/database";
import { format, parseISO } from "date-fns";

export function generateAuditCSV(entries: AuditLogEntry[]): string {
  const headers = [
    "Timestamp",
    "User ID",
    "Action",
    "Entity Type",
    "Entity ID",
    "Before",
    "After",
  ];

  const rows = entries.map((e) => [
    format(parseISO(e.created_at), "dd/MM/yyyy HH:mm:ss"),
    e.user_id || "",
    e.action,
    e.entity_type,
    e.entity_id || "",
    e.before_value ? JSON.stringify(e.before_value) : "",
    e.after_value ? JSON.stringify(e.after_value) : "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}
