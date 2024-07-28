import { CurrentStage } from "./CurrentStage";
import { Stages } from "./Stages";
import { getServerSession } from "next-auth";
import { getGrantById } from "~~/services/database/repositories/grants";
import { authOptions } from "~~/utils/auth";

export type GrantWithStages = Awaited<ReturnType<typeof getGrantById>>;

const GrantsDetailPage = async ({ params }: { params: { grantId: string } }) => {
  const grantId = Number(params.grantId);
  const session = await getServerSession(authOptions);

  const grant = await getGrantById(grantId);

  if (!grant) {
    return (
      <div className="flex items-center text-xl flex-col flex-grow pt-10 space-y-4">No grant with id {grantId}</div>
    );
  }

  if (session?.user?.role !== "admin" && grant.builderAddress !== session?.user.address) {
    return <div className="flex items-center text-xl flex-col flex-grow pt-10 space-y-4">Access denied</div>;
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10 space-y-4">
      <h1 className="text-3xl font-extrabold mb-16">{grant.title}</h1>
      <CurrentStage grant={grant} />
      <Stages stages={grant.stages} grantId={grant.id} />
    </div>
  );
};

export default GrantsDetailPage;
