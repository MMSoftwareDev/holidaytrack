import { NextResponse, type NextRequest } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("holiday_requests")
    .select("*, employee:employees(first_name, last_name, email)")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Only allow cancellation by the employee
  if (body.status === "cancelled") {
    const { data: req } = await supabase
      .from("holiday_requests")
      .select("employee_id, status, amount, leave_type")
      .eq("id", params.id)
      .single();

    if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (req.employee_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (req.status !== "pending" && req.status !== "approved") {
      return NextResponse.json({ error: "Cannot cancel this request" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("holiday_requests")
      .update({ status: "cancelled" })
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Invalid update" }, { status: 400 });
}
