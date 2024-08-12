import { getServerSession } from "next-auth";
import { isAddress } from "viem";
import { GrantBuilderAlert } from "~~/app/my-grants/GrantBuilderAlert";
import { GrantsList } from "~~/app/my-grants/GrantsList";
import { authOptions } from "~~/utils/auth";

const BuilderGrants = async ({ params }: { params: { address: string } }) => {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return <div className="flex items-center flex-col flex-grow pt-10 px-4">Access denied</div>;
  }

  const { address } = params;
  if (!isAddress(address)) {
    return <div className="flex items-center flex-col flex-grow pt-10 px-4">Wrong address</div>;
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10 px-4">
      <GrantBuilderAlert address={address} className="mb-10" />
      <GrantsList address={address} />
    </div>
  );
};

export default BuilderGrants;
