import { NextResponse } from "next/server";
import { recoverTypedDataAddress } from "viem";
import { GrantInsert, createGrant } from "~~/services/database/repositories/grants";
import { EIP_712_DOMAIN, EIP_712_TYPES__APPLY_FOR_GRANT } from "~~/utils/eip712";

export type CreateNewGrantReqBody = GrantInsert & { signature: `0x${string}` };

const validateBody = (newGrant: Partial<CreateNewGrantReqBody>): newGrant is CreateNewGrantReqBody => {
  if (
    !newGrant.title ||
    !newGrant.description ||
    !newGrant.builderAddress ||
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

    const { signature, ...newGrant } = body;
    const recoveredAddress = await recoverTypedDataAddress({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__APPLY_FOR_GRANT,
      primaryType: "Message",
      message: { title: body.title, description: body.description },
      signature,
    });

    if (recoveredAddress !== newGrant.builderAddress)
      return NextResponse.json({ error: "Recovered address did not match signer" }, { status: 401 });

    const result = await createGrant(newGrant);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating grant" }, { status: 500 });
  }
}
