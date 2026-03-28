import { NextResponse, type NextRequest } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employee_id");

  let query = supabase
    .from("entitlements")
    .select("*, employee:employees(first_name, last_name, email)")
    .eq("org_id", currentEmployee.org_id)
    .order("year_start", { ascending: false });

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  const { data, error } = await query;

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
  const { employee_id, year_start, year_end, total_ordinary, total_additional, carried_forward } = body;

  if (!employee_id || !year_start || !year_end) {
    return NextResponse.json({ error: "Missing required fields: employee_id, year_start, year_end" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("entitlements")
    .insert({
      employee_id,
      org_id: currentEmployee.org_id,
      year_start,
      year_end,
      total_ordinary: total_ordinary || 28,
      total_additional: total_additional || 0,
      carried_forward: carried_forward || 0,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
