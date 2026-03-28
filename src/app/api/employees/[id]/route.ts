import { NextResponse, type NextRequest } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function GET(
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
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!currentEmployee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", currentEmployee.org_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

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

  const { data, error } = await supabase
    .from("employees")
    .update(body)
    .eq("id", params.id)
    .eq("org_id", currentEmployee.org_id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
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

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", params.id)
    .eq("org_id", currentEmployee.org_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
