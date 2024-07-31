import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { recoverTypedDataAddress } from "viem";
import { getGrantById } from "~~/services/database/repositories/grants";
import { StageInsert, createStage } from "~~/services/database/repositories/stages";
import { authOptions } from "~~/utils/auth";
import { EIP_712_DOMAIN, EIP_712_TYPES__APPLY_FOR_STAGE } from "~~/utils/eip712";

export type CreateNewStageReqBody = StageInsert & { signature: `0x${string}` };

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = (await req.json()) as CreateNewStageReqBody;

    if (!body.milestone || !body.signature)
      return NextResponse.json({ error: "Invalid form details submitted" }, { status: 400 });

    const { signature, ...newStage } = body;

    const grant = await getGrantById(newStage.grantId);
    if (!grant) return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    const latestStage = grant.stages[0];

    const recoveredAddress = await recoverTypedDataAddress({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__APPLY_FOR_STAGE,
      primaryType: "Message",
      message: { stage_number: (latestStage.stageNumber + 1).toString(), milestone: body.milestone },
      signature,
    });

    if (grant.builderAddress !== session?.user.address)
      return NextResponse.json({ error: "Only owner can apply for new stage" }, { status: 401 });

    if (session?.user.address !== recoveredAddress)
      return NextResponse.json({ error: "Recovered address did not match session address" }, { status: 403 });

    // check if previous stage was completed
    if (latestStage.status !== "completed") {
      return NextResponse.json(
        { error: `Previous stage ${latestStage.stageNumber} must be completed before creating a new stage` },
        { status: 400 },
      );
    }

    const [createdStage] = await createStage({
      grantId: newStage.grantId,
      milestone: newStage.milestone,
      stageNumber: latestStage.stageNumber + 1,
    });

    return NextResponse.json({ grantId: newStage.grantId, stageId: createdStage.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating grant" }, { status: 500 });
  }
}
