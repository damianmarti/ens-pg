import { Stages } from "./Stages";
import { getGrantById } from "~~/services/database/repositories/grants";

const GrantsDetailPage = async ({ params }: { params: { grantId: string } }) => {
  const grantId = params.grantId;
  const grant = await getGrantById(Number(grantId));
  if (!grant) {
    return <h1>Grant not found</h1>;
  }
  return (
    <div className="flex items-center flex-col flex-grow pt-10 space-y-4">
      <h1 className="text-2xl p-0">Grant title: {grant.title}</h1>
      <Stages stages={[...grant.stages.reverse()]} grantId={grant.id} />
    </div>
  );
};

export default GrantsDetailPage;
