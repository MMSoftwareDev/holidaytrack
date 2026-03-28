"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Search } from "lucide-react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees } from "@/lib/swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employee } from "@/types/database";

export default function EmployeesPage() {
  const { isDark } = useTheme();
  const { authUser } = useAuth();
  const colors = getThemeColors(isDark);
  const [mounted, setMounted] = useState(false);
  const { data: employees, isLoading } = useEmployees();
  const [search, setSearch] = useState("");

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const isAdmin = authUser?.employee?.role === "admin" || authUser?.employee?.role === "super_admin";

  const filtered = (employees || []).filter((emp: Employee) => {
    const q = search.toLowerCase();
    return (
      emp.first_name.toLowerCase().includes(q) ||
      emp.last_name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q)
    );
  });

  const formatRole = (role: string) => {
    return role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatContract = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
          Employees
        </h1>
        {isAdmin && (
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.text3 }} />
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-lg border text-sm outline-none transition-colors duration-150"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
            fontFamily: "Inter, sans-serif",
          }}
        />
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <div
            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ backgroundColor: `${colors.primary}12` }}
          >
            <Users className="w-6 h-6" style={{ color: colors.primary }} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
            No employees found
          </p>
          <p className="text-xs" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>
            {search ? "Try a different search term" : "Add your first employee to get started"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: colors.border }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB" }}>
                  <th
                    className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3"
                    style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}
                  >
                    Name
                  </th>
                  <th
                    className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3"
                    style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}
                  >
                    Email
                  </th>
                  <th
                    className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3"
                    style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}
                  >
                    Role
                  </th>
                  <th
                    className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3"
                    style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}
                  >
                    Contract
                  </th>
                  <th
                    className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3"
                    style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp: Employee) => (
                  <tr
                    key={emp.id}
                    className="border-b last:border-b-0 transition-colors duration-150 hover:opacity-80 cursor-pointer"
                    style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
                        {emp.first_name} {emp.last_name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: colors.text2, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        {emp.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: colors.text2, fontFamily: "Inter, sans-serif" }}>
                        {formatRole(emp.role)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: colors.text2, fontFamily: "Inter, sans-serif" }}>
                        {formatContract(emp.contract_type)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={emp.is_active ? "approved" : "cancelled"}>
                        {emp.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
