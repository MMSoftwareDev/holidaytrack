import { NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("id, org_id, first_name, last_name, email, role, is_active, holiday_unit, days_per_week, hours_per_week")
    .eq("id", user.id)
    .single();

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  // Get current entitlement
  const now = new Date();
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("*")
    .eq("employee_id", user.id)
    .lte("year_start", now.toISOString().split("T")[0])
    .gte("year_end", now.toISOString().split("T")[0])
    .single();

  // Get recent requests
  const { data: recentRequests } = await supabase
    .from("holiday_requests")
    .select("id, start_date, end_date, amount, holiday_unit, leave_type, status, employee_notes, created_at")
    .eq("employee_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    employee,
    entitlement,
    recentRequests: recentRequests || [],
  });
}
