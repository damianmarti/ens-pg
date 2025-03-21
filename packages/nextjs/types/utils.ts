import { PublicGrant, getBuilderGrants } from "~~/services/database/repositories/grants";
import { PublicLargeGrant, getBuilderLargeGrants } from "~~/services/database/repositories/large-grants";

export type Tuple<T, MaxLength extends number = 10, Current extends T[] = []> = Current["length"] extends MaxLength
  ? Current
  : Current | Tuple<T, MaxLength, [T, ...Current]>;

// Add a discriminator property to distinguish between PublicGrant and PublicLargeGrant
export type DiscriminatedPublicGrant = (PublicGrant & { type: "grant" }) | (PublicLargeGrant & { type: "largeGrant" });

export type BuilderGrant = Awaited<ReturnType<typeof getBuilderGrants>>[0];

export type BuilderLargeGrant = Awaited<ReturnType<typeof getBuilderLargeGrants>>[0];

// Add a discriminator property to distinguish between Grant and LargeGrant
export type DiscriminatedBuilderGrant =
  | (BuilderGrant & { type: "grant" })
  | (BuilderLargeGrant & { type: "largeGrant" });
