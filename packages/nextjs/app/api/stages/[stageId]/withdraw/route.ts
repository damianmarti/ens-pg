import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { parseEther, recoverTypedDataAddress } from "viem";
import {
  WithdrawModalFormValues,
  withdrawModalFormSchema,
} from "~~/app/grants/[grantId]/_components/CurrentStage/WithdrawModal/schema";
import { createWithdrawal } from "~~/services/database/repositories/withdrawals";
import { authOptions } from "~~/utils/auth";
import { EIP_712_DOMAIN, EIP_712_TYPES__WITHDRAW_FROM_STAGE } from "~~/utils/eip712";

export type StageWithdrawReqBody = WithdrawModalFormValues & { signature: `0x${string}` };

export async function POST(req: NextRequest, { params }: { params: { stageId: string } }) {
  try {
    const { stageId } = params;
    const session = await getServerSession(authOptions);

    const body = (await req.json()) as StageWithdrawReqBody;
    const { completedMilestones, withdrawAmount, signature } = body;

    const recoveredAddress = await recoverTypedDataAddress({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__WITHDRAW_FROM_STAGE,
      primaryType: "Message",
      message: {
        stageId,
        completedMilestones,
        withdrawAmount,
      },
      signature,
    });

    if (session?.user.address !== recoveredAddress)
      return NextResponse.json({ error: "Recovered address did not match session address" }, { status: 403 });

    try {
      withdrawModalFormSchema.parse({ completedMilestones, withdrawAmount });
    } catch (err) {
      return NextResponse.json({ error: "Invalid form details submitted" }, { status: 400 });
    }

    // TODO: withdraw from contract

    await createWithdrawal({
      stageId: Number(stageId),
      withdrawAmount: parseEther(withdrawAmount),
      milestones: completedMilestones,
    });

    return NextResponse.json({ stageId, withdrawAmount }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Withdraw error" }, { status: 500 });
  }
}
