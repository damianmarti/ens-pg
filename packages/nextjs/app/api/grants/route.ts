import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAllGrants } from "~~/services/database/repositories/grants";
import { authOptions } from "~~/utils/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user.role !== "admin") return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const grants = await getAllGrants();
    return NextResponse.json(grants);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching grants" }, { status: 500 });
  }
}
