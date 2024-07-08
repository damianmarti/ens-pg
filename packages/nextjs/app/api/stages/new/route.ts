import { NextResponse } from "next/server";
import { recoverTypedDataAddress } from "viem";
import { getGrantById } from "~~/services/database/repositories/grants";
import { StageInsert, createStage } from "~~/services/database/repositories/stages";
import { EIP_712_DOMAIN, EIP_712_TYPES__APPLY_FOR_STAGE } from "~~/utils/eip712";

export type CreateNewStageReqBody = StageInsert & { signer: string; signature: `0x${string}` };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateNewStageReqBody;

    if (!body.title || !body.signer || !body.signature)
      return NextResponse.json({ error: "Invalid form details submitted" }, { status: 400 });

    const { signature, signer, ...newStage } = body;
    const recoveredAddress = await recoverTypedDataAddress({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__APPLY_FOR_STAGE,
      primaryType: "Message",
      message: { title: body.title },
      signature,
    });

    if (recoveredAddress !== signer)
      return NextResponse.json({ error: "Recovered address did not match signer" }, { status: 401 });

    const grant = await getGrantById(newStage.grantId);
    if (!grant) return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    const latestStage = grant.stages[0];

    // check if previous stage was completed
    if (latestStage.status !== "completed") {
      return NextResponse.json(
        { error: `Previous stage ${latestStage.stageNumber} must be completed before creating a new stage` },
        { status: 400 },
      );
    }

    const [createdStage] = await createStage({
      grantId: newStage.grantId,
      title: `Stage ${latestStage.stageNumber + 1}`,
      stageNumber: latestStage.stageNumber + 1,
    });

    return NextResponse.json({ grantId: newStage.grantId, stageId: createdStage.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating grant" }, { status: 500 });
  }
}
