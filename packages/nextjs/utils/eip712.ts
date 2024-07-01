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
