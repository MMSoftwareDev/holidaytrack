import { NextResponse, type NextRequest } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get current user's org_id
  const { data: currentEmployee } = await supabase
    .from("employees")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!currentEmployee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const includeEntitlements = searchParams.get("include_entitlements") === "true";

  const selectColumns = includeEntitlements
    ? "id, first_name, last_name, email, role, contract_type, holiday_unit, days_per_week, hours_per_week, start_date, is_active, created_at, entitlements(id, year_start, year_end, total_ordinary, total_additional, used_ordinary, used_additional, pending_ordinary, pending_additional, carried_forward)"
    : "id, first_name, last_name, email, role, contract_type, holiday_unit, days_per_week, hours_per_week, start_date, is_active, created_at";

  const { data, error } = await supabase
    .from("employees")
    .select(selectColumns)
    .eq("org_id", currentEmployee.org_id)
    .order("last_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check user is admin
  const { data: currentEmployee } = await supabase
    .from("employees")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (!currentEmployee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  if (currentEmployee.role !== "admin" && currentEmployee.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { first_name, last_name, email, role, start_date, contract_type, holiday_unit, days_per_week, hours_per_week } = body;

  if (!first_name || !last_name || !email || !role || !start_date) {
    return NextResponse.json({ error: "Missing required fields: first_name, last_name, email, role, start_date" }, { status: 400 });
  }

  const { data: employee, error } = await supabase
    .from("employees")
    .insert({
      org_id: currentEmployee.org_id,
      first_name,
      last_name,
      email,
      role,
      start_date,
      contract_type: contract_type || "full_time",
      holiday_unit: holiday_unit || "days",
      days_per_week: parseInt(days_per_week, 10) || 5,
      hours_per_week: parseInt(hours_per_week, 10) || 37,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(employee, { status: 201 });
}
