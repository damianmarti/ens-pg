import { NextResponse } from "next/server";
import { createGrant } from "~~/services/database/repositories/grants";

// TODO This should be a POST request
export async function GET() {
  const newGrant = {
    title: `Grant Title ${Math.random().toString(36).substring(7)}`,
    description: "Description of the new grant",
  };

  try {
    const result = await createGrant(newGrant);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating grant" }, { status: 500 });
  }
}
