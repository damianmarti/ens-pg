import { NextRequest } from "next/server";
import { createPrivateNoteRequest } from "~~/app/api/stages/[stageId]/private-note/route";

export async function POST(req: NextRequest, { params }: { params: { stageId: string } }) {
  return createPrivateNoteRequest(req, { params, isLargeGrant: true });
}
