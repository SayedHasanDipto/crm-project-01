import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Lead from "@/lib/models/Lead";
import { headers } from "next/headers";

async function getUser() {
  const session = await auth.api.getSession({ headers: headers() });
  return session?.user ?? null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const leads = await Lead.find({ userId: user.id }).sort({ lastContactedAt: 1 }).lean();
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, company, phone, status, lastContactedAt, notes } = body;

  if (!name || !email || !lastContactedAt) {
    return NextResponse.json({ error: "name, email, lastContactedAt are required" }, { status: 400 });
  }

  await connectDB();
  const lead = await Lead.create({
    userId: user.id,
    name,
    email,
    company,
    phone,
    status: status ?? "new",
    lastContactedAt: new Date(lastContactedAt),
    notes
  });

  return NextResponse.json(lead, { status: 201 });
}
