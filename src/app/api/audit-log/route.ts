import { NextResponse } from "next/server";
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
    .from("audit_log")
    .select("id, user_id, entity_type, entity_id, action, created_at")
    .eq("org_id", currentEmployee.org_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
