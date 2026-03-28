import { NextResponse, type NextRequest } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Verify user is manager/admin
  const { data: employee } = await supabase
    .from("employees")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!employee || !["manager", "admin", "super_admin"].includes(employee.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: req } = await supabase
    .from("holiday_requests")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (req.status !== "pending") return NextResponse.json({ error: "Request is not pending" }, { status: 400 });

  const { error: updateError } = await supabase
    .from("holiday_requests")
    .update({ status: "declined" })
    .eq("id", params.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  await supabase.from("approval_actions").insert({
    request_id: params.id,
    actioned_by: user.id,
    action: "declined",
    reason: body.reason || null,
  });

  return NextResponse.json({ message: "Request declined" });
}
