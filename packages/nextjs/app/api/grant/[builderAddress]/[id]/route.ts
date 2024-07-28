import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getGrantById } from "~~/services/database/repositories/grants";
import { authOptions } from "~~/utils/auth";

export type BuilderGrantResponse = Awaited<ReturnType<typeof getGrantById>>;

// TODO: Currenly not in use. Recheck later, remove if not needed
export async function GET(_request: Request, { params }: { params: { builderAddress: string; id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const { builderAddress, id } = params;

    if (session?.user?.role !== "admin" && session?.user?.address !== builderAddress) {
      return NextResponse.json("Access denied", { status: 403 });
    }

    const grant = await getGrantById(Number(id));
    return NextResponse.json(grant, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
