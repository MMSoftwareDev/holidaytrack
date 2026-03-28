import { NextResponse, type NextRequest } from "next/server";
import { createServerComponentClient, createServiceClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { firstName, lastName, orgName } = body;

  if (!firstName || !lastName || !orgName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Check if employee already exists (idempotent)
  const { data: existing } = await serviceClient
    .from("employees")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ message: "Already set up" });
  }

  // Create organisation
  const slug = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Date.now().toString(36);

  const { data: org, error: orgError } = await serviceClient
    .from("organisations")
    .insert({
      name: orgName,
      slug,
    })
    .select("id")
    .single();

  if (orgError) {
    return NextResponse.json({ error: "Failed to create organisation" }, { status: 500 });
  }

  // Create employee as admin
  const { error: empError } = await serviceClient
    .from("employees")
    .insert({
      id: user.id,
      org_id: org.id,
      first_name: firstName,
      last_name: lastName,
      email: user.email!,
      role: "admin",
      start_date: new Date().toISOString().split("T")[0],
    });

  if (empError) {
    return NextResponse.json({ error: "Failed to create employee record" }, { status: 500 });
  }

  // Create default entitlement for current year
  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const yearEnd = `${now.getFullYear()}-12-31`;

  await serviceClient.from("entitlements").insert({
    employee_id: user.id,
    org_id: org.id,
    year_start: yearStart,
    year_end: yearEnd,
    total_ordinary: 28,
  });

  return NextResponse.json({ message: "Account set up successfully" });
}
