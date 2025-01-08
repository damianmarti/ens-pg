import { ApprovedGrantsList } from "./ApprovedGrantsList";
import { getPublicGrants } from "~~/services/database/repositories/grants";

export const ApprovedGrants = async () => {
  const allGrants = await getPublicGrants();
  const approvedGrants = allGrants.filter(grant =>
    grant.stages.some(stage => stage.status === "approved" || stage.status === "completed"),
  );

  if (approvedGrants.length === 0) return null;

  return (
    <div className="py-10 px-4 flex flex-col items-center w-full">
      <h2 className="text-3xl font-black !mb-0">Grantees</h2>
      <ApprovedGrantsList approvedGrants={approvedGrants} />
    </div>
  );
};
