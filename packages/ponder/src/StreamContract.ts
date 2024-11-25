import { ponder } from "@/generated";

ponder.on("Stream:Withdraw", async ({ event, context }) => {
  try {
    const { db } = context;

    await db.Withdrawal.create({
      id: `${event.args.to}-${event.log.address}-${event.log.blockNumber}`,
      data: {
        to: event.args.to,
        amount: event.args.amount,
        reason: event.args.reason,
        grantId: event.args.grantId,
        grantNumber: event.args.grantNumber,
        stageNumber: event.args.stageNumber,
        timestamp: event.block.timestamp,
      },
    });

    // TODO: Change url before deploying
    await fetch("http://localhost:3000/api/stages/revalidate-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          grantNumber: event.args.grantNumber,
          stageNumber: event.args.stageNumber,
          builderAddress: event.args.to,
          contractGrantId: event.args.grantId,
        },
        replacer
      ),
    });
  } catch (error) {
    console.log("Error in Stream:Withdraw", error);
  }
});

// To be used in JSON.stringify when a field might be bigint
// https://wagmi.sh/react/faq#bigint-serialization
export const replacer = (_key: string, value: unknown) =>
  typeof value === "bigint" ? value.toString() : value;
