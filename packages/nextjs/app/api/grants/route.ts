import { NextResponse } from "next/server";
import { getAllGrants } from "~~/services/database/repositories/grants";

export async function GET() {
  try {
    const grants = await getAllGrants();
    return NextResponse.json(grants);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching grants" }, { status: 500 });
  }
}
