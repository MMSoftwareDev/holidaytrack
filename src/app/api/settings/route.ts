import { NextResponse, type NextRequest } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: currentEmployee } = await supabase
    .from("employees")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!currentEmployee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("organisations")
    .select("*")
    .eq("id", currentEmployee.org_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const allowedFields: Record<string, unknown> = {};

  if (body.name !== undefined) allowedFields.name = body.name;
  if (body.holiday_year_start_month !== undefined) allowedFields.holiday_year_start_month = body.holiday_year_start_month;
  if (body.holiday_year_start_day !== undefined) allowedFields.holiday_year_start_day = body.holiday_year_start_day;
  if (body.default_holiday_unit !== undefined) allowedFields.default_holiday_unit = body.default_holiday_unit;
  if (body.bank_holiday_region !== undefined) allowedFields.bank_holiday_region = body.bank_holiday_region;
  if (body.carry_forward_cap !== undefined) allowedFields.carry_forward_cap = body.carry_forward_cap;

  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("organisations")
    .update(allowedFields)
    .eq("id", currentEmployee.org_id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
