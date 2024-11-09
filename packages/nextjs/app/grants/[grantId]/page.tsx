import { CurrentStage } from "./_components/CurrentStage";
import { GrantDetails } from "./_components/GrantDetails";
import { ProjectTimeline } from "./_components/ProjectTimeline";
import { getServerSession } from "next-auth";
import { getGrantById, getRejectedGrantsCountLessThanGrantNumber } from "~~/services/database/repositories/grants";
import { authOptions } from "~~/utils/auth";

export type GrantWithStages = Awaited<ReturnType<typeof getGrantById>>;

const Grant = async ({ params }: { params: { grantId: string } }) => {
  const grantId = Number(params.grantId);
  const session = await getServerSession(authOptions);

  const grant = await getGrantById(grantId);
  // NOTE: We use this count to correctly calculate grantNumber in contract.
  // - Contract maintains `builderGrants` mapping in array where index represent grantNumber and value of that array represent grantId
  // - Since we don't store rejected grants in contract, the grantsNumber will less than or equal to databse `grantNumber`
  // - less than when there are rejected grants, equal when there are no rejected grants
  // - hence this logic subracts all the rejecteGrants count that are less than current gratNumber, and thats how we get correct contract index (CurrentStage read contract logic)
  const rejectedCount = await getRejectedGrantsCountLessThanGrantNumber(grantId);

  if (!grant) {
    return (
      <div className="flex items-center text-xl flex-col flex-grow pt-10 space-y-4">No grant with id {grantId}</div>
    );
  }

  if (session?.user?.role !== "admin" && grant.builderAddress !== session?.user.address) {
    return <div className="flex items-center text-xl flex-col flex-grow pt-10 space-y-4">Access denied</div>;
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10 space-y-8 px-2">
      <h1 className="text-3xl font-extrabold">{grant.title}</h1>
      <GrantDetails grant={grant} />
      <CurrentStage grant={grant} rejectedCount={rejectedCount} />
      <ProjectTimeline stages={grant.stages} grant={grant} />
    </div>
  );
};

export default Grant;
