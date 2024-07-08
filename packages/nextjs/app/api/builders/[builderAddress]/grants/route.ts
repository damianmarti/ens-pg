import { NextResponse } from "next/server";
import { getBuilderGrants } from "~~/services/database/repositories/grants";

export type BuilderGrantsResponse = Awaited<ReturnType<typeof getBuilderGrants>>;

export async function GET(_request: Request, { params }: { params: { builderAddress: string } }) {
  try {
    const builderAddress = params.builderAddress;
    const grants = await getBuilderGrants(builderAddress);
    return NextResponse.json(grants, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
