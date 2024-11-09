import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { parseEther, recoverTypedDataAddress } from "viem";
import {
  ApprovalVoteModalFormValues,
  approvalVoteModalFormSchema,
} from "~~/app/admin/_components/ApprovalVoteModal/schema";
import { createApprovalVote } from "~~/services/database/repositories/approval-votes";
import { authOptions } from "~~/utils/auth";
import { EIP_712_DOMAIN, EIP_712_TYPES__STAGE_APPROVAL_VOTE } from "~~/utils/eip712";

export type ApprovalVoteReqBody = ApprovalVoteModalFormValues & { signature: `0x${string}` };

export async function POST(req: NextRequest, { params }: { params: { stageId: string } }) {
  try {
    const { stageId } = params;
    const session = await getServerSession(authOptions);

    const body = (await req.json()) as ApprovalVoteReqBody;
    const { grantAmount, signature } = body;

    const recoveredAddress = await recoverTypedDataAddress({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__STAGE_APPROVAL_VOTE,
      primaryType: "Message",
      message: {
        grantAmount,
        stageId,
      },
      signature,
    });

    if (session?.user.address !== recoveredAddress)
      return NextResponse.json({ error: "Recovered address did not match session address" }, { status: 403 });

    if (session?.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can review stages" }, { status: 403 });
    }

    try {
      approvalVoteModalFormSchema.parse({ grantAmount });
    } catch (err) {
      return NextResponse.json({ error: "Invalid form details submitted" }, { status: 400 });
    }

    const approvalVoteId = await createApprovalVote({
      stageId: Number(stageId),
      amount: parseEther(grantAmount),
      authorAddress: session.user.address,
    });

    return NextResponse.json({ approvalVoteId }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Error creating approval vote" }, { status: 500 });
  }
}
