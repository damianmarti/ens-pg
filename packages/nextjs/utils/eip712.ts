export const EIP_712_DOMAIN = {
  name: "ENS PG Grants",
  version: "1",
} as const;

export const EIP_712_TYPES__APPLY_FOR_GRANT = {
  Message: [
    { name: "title", type: "string" },
    { name: "description", type: "string" },
  ],
} as const;

export const EIP_712_TYPES__APPLY_FOR_STAGE = {
  Message: [
    { name: "stage_number", type: "string" },
    { name: "milestone", type: "string" },
  ],
} as const;

export const EIP_712_TYPES__REVIEW_STAGE = {
  Message: [
    { name: "stageId", type: "string" },
    { name: "action", type: "string" },
    { name: "txHash", type: "string" },
  ],
} as const;
