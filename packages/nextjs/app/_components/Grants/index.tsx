import { ApprovedGrantsList } from "./ApprovedGrantsList";
import { GrantWithStages } from "~~/app/grants/[grantId]/page";
import { getAllGrants } from "~~/services/database/repositories/grants";

export const ApprovedGrants = async () => {
  const allGrants = await getAllGrants();
  const approvedGrants = allGrants.filter(grant =>
    grant.stages.some(stage => stage.status === "approved" || stage.status === "completed"),
  ) as NonNullable<GrantWithStages>[];

  if (approvedGrants.length === 0) return null;

  return (
    <div className="py-10 px-4 flex flex-col items-center w-full">
      <h2 className="text-3xl font-black !mb-0">Grantees</h2>
      <ApprovedGrantsList approvedGrants={approvedGrants} />
    </div>
  );
};
