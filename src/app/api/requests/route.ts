import { NextResponse, type NextRequest } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const role = searchParams.get("role");

  let query = supabase
    .from("holiday_requests")
    .select("id, employee_id, start_date, end_date, amount, holiday_unit, leave_type, status, employee_notes, created_at, updated_at, employee:employees(first_name, last_name, email)")
    .order("created_at", { ascending: false });

  // If manager role, show requests they can approve (RLS handles scoping)
  if (role !== "manager") {
    query = query.eq("employee_id", user.id);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { start_date, end_date, amount, holiday_unit, leave_type, employee_notes } = body;

  if (!start_date || !end_date || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Get employee's org_id
  const { data: employee } = await supabase
    .from("employees")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  // Create request
  const { data: req, error } = await supabase
    .from("holiday_requests")
    .insert({
      employee_id: user.id,
      org_id: employee.org_id,
      start_date,
      end_date,
      amount,
      holiday_unit: holiday_unit || "days",
      leave_type: leave_type || "ordinary",
      employee_notes: employee_notes || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(req, { status: 201 });
}
