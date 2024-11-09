import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Withdrawal: p.createTable({
    id: p.string(),
    to: p.hex(),
    amount: p.bigint(),
    reason: p.string(),
    grantId: p.bigint(),
    grantNumber: p.int(),
    stageNumber: p.int(),
    timestamp: p.bigint(),
  }),
}));
