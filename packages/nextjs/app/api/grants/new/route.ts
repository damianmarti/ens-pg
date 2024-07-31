import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { recoverTypedDataAddress } from "viem";
import { GrantInsert, createGrant } from "~~/services/database/repositories/grants";
import { createStage } from "~~/services/database/repositories/stages";
import { authOptions } from "~~/utils/auth";
import { EIP_712_DOMAIN, EIP_712_TYPES__APPLY_FOR_GRANT } from "~~/utils/eip712";

export type CreateNewGrantReqBody = Omit<GrantInsert, "builderAddress"> & { signature: `0x${string}` };

const validateBody = (newGrant: Partial<CreateNewGrantReqBody>): newGrant is CreateNewGrantReqBody => {
  if (
    !newGrant.title ||
    !newGrant.description ||
    !newGrant.signature ||
    newGrant.description.length > 750 ||
    newGrant.title.length > 75
  ) {
    return false;
  }
  return true;
};

export async function POST(req: Request) {
  try {
    const body: Partial<CreateNewGrantReqBody> = await req.json();

    if (!validateBody(body)) return NextResponse.json({ error: "Invalid form details submitted" }, { status: 400 });

    const session = await getServerSession(authOptions);

    const { signature, ...newGrant } = body;
    const recoveredAddress = await recoverTypedDataAddress({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__APPLY_FOR_GRANT,
      primaryType: "Message",
      message: { title: body.title, description: body.description },
      signature,
    });

    if (session?.user.address !== recoveredAddress)
      return NextResponse.json({ error: "Recovered address did not match session address" }, { status: 403 });

    const [createdGrant] = await createGrant({ ...newGrant, builderAddress: session.user.address });

    const [createdStage] = await createStage({
      grantId: createdGrant.id,
    });

    return NextResponse.json({ grantId: createdGrant.id, stageId: createdStage.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating grant" }, { status: 500 });
  }
}
