import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getBuilderGrants } from "~~/services/database/repositories/grants";
import { authOptions } from "~~/utils/auth";

export type BuilderGrantsResponse = Awaited<ReturnType<typeof getBuilderGrants>>;

export async function GET(_request: Request, { params }: { params: { builderAddress: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const builderAddress = params.builderAddress;

    if (session?.user.address !== builderAddress && session?.user.role !== "admin") {
      return NextResponse.json("Access denied", { status: 403 });
    }

    const grants = await getBuilderGrants(builderAddress);
    return NextResponse.json(grants, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
