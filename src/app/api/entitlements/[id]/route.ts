import { NextResponse, type NextRequest } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  if (body.total_ordinary !== undefined) allowedFields.total_ordinary = body.total_ordinary;
  if (body.total_additional !== undefined) allowedFields.total_additional = body.total_additional;
  if (body.carried_forward !== undefined) allowedFields.carried_forward = body.carried_forward;

  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("entitlements")
    .update(allowedFields)
    .eq("id", params.id)
    .eq("org_id", currentEmployee.org_id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Entitlement not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
