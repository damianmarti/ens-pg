import { NextRequest, NextResponse } from "next/server";
import { recoverTypedDataAddress } from "viem";
import { StageUpdate, updateStage } from "~~/services/database/repositories/stages";
import { EIP_712_DOMAIN, EIP_712_TYPES__REVIEW_STAGE } from "~~/utils/eip712";

export type ReviewStageBody = {
  status: Required<StageUpdate>["status"];
  approvedTx?: StageUpdate["approvedTx"];
  signature: `0x${string}`;
  signer: string;
};

//TODO: Make sure the signer is admin
export async function POST(req: NextRequest, { params }: { params: { stageId: string } }) {
  try {
    const { stageId } = params;
    const body = (await req.json()) as ReviewStageBody;

    const recoveredAddress = await recoverTypedDataAddress({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__REVIEW_STAGE,
      primaryType: "Message",
      message: {
        stageId,
        action: body.status,
        txHash: body.approvedTx ?? "",
      },
      signature: body.signature,
    });

    if (recoveredAddress !== body.signer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (body.status === "approved" && !body.approvedTx) {
      return NextResponse.json({ error: "Approved grants must have a transaction hash" }, { status: 400 });
    }

    const approvedObj = body.approvedTx ? { approvedTx: body.approvedTx, approvedAt: new Date() } : {};
    await updateStage(Number(stageId), {
      status: body.status,
      ...approvedObj,
    });

    return NextResponse.json({ stageId, status: body.status }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Error processing form" }, { status: 500 });
  }
}
