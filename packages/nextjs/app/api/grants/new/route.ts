import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { parseEther, recoverTypedDataAddress } from "viem";
import { applyFormSchema } from "~~/app/apply/schema";
import { GrantInsert, createGrant } from "~~/services/database/repositories/grants";
import { createStage } from "~~/services/database/repositories/stages";
import { authOptions } from "~~/utils/auth";
import { EIP_712_DOMAIN, EIP_712_TYPES__APPLY_FOR_GRANT } from "~~/utils/eip712";

export type CreateNewGrantReqBody = Omit<GrantInsert, "requestedFunds" | "builderAddress"> & {
  requestedFunds: string;
  signature: `0x${string}`;
};

export async function POST(req: Request) {
  try {
    const body: CreateNewGrantReqBody = await req.json();

    const session = await getServerSession(authOptions);

    const { signature, ...newGrant } = body;

    try {
      applyFormSchema.parse(newGrant);
    } catch (err) {
      return NextResponse.json({ error: "Invalid form details submitted" }, { status: 400 });
    }

    const recoveredAddress = await recoverTypedDataAddress({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__APPLY_FOR_GRANT,
      primaryType: "Message",
      message: {
        ...newGrant,
        showcaseVideoUrl: newGrant.showcaseVideoUrl || "",
        twitter: newGrant.twitter || "",
        telegram: newGrant.telegram || "",
      },
      signature,
    });

    if (session?.user.address !== recoveredAddress)
      return NextResponse.json({ error: "Recovered address did not match session address" }, { status: 401 });

    const [createdGrant] = await createGrant({
      ...newGrant,
      builderAddress: session.user.address,
      requestedFunds: parseEther(newGrant.requestedFunds),
    });

    const [createdStage] = await createStage({
      grantId: createdGrant.id,
    });

    return NextResponse.json({ grantId: createdGrant.id, stageId: createdStage.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating grant" }, { status: 500 });
  }
}
