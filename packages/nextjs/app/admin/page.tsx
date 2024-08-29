import { redirect } from "next/navigation";
import { GrantWithStagesAndPrivateNotes, Proposal } from "./_components/Proposal";
import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import { SignInBtn } from "~~/components/pg-ens/SignInBtn";
import { getAllGrantsWithStagesAndPrivateNotes } from "~~/services/database/repositories/grants";
import { authOptions } from "~~/utils/auth";

export const revalidate = 0;

const Admin: NextPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center px-4 py-10 sm:py-20">
        <h1 className="text-3xl text-center font-extrabold mb-1">Sign In</h1>
        <p className="mb-6">You need to sign in to access the admin dashboard.</p>
        <SignInBtn />
      </div>
    );
  }

  if (session?.user?.role !== "admin") {
    return redirect("/");
  }

  const allGrants = await getAllGrantsWithStagesAndPrivateNotes();

  const submissionsByBuilderAddress: { [key: string]: number } = {};
  const grantProposals: Array<NonNullable<GrantWithStagesAndPrivateNotes>> = [];
  const stageProposals: Array<NonNullable<GrantWithStagesAndPrivateNotes>> = [];

  allGrants.forEach(grant => {
    const latestStage = grant.stages[0];

    if (latestStage?.status === "proposed") {
      const builderSubmissions = submissionsByBuilderAddress[grant.builderAddress] || 0;
      // count builder submissions
      submissionsByBuilderAddress[grant.builderAddress] = builderSubmissions + 1;
      if (latestStage.stageNumber === 1) {
        // stage 1 proposed grants
        grantProposals.push(grant);
      } else {
        // grants that have passed stage 1 and are in proposed stage
        stageProposals.push(grant);
      }
    }
  });

  return (
    <div className="flex flex-col flex-grow px-4 py-10 sm:py-20">
      <h1 className="text-3xl text-center font-extrabold !mb-0">Pending proposals</h1>

      <div className="mt-10 mx-auto grid md:grid-cols-2 gap-4 sm:gap-8 w-full sm:max-w-6xl">
        <div className="flex flex-col items-center p-4 sm:p-6 bg-[#FBE6F4] rounded-xl">
          <h2 className="text-2xl font-bold !m-0">New Grant Proposals ({grantProposals.length})</h2>
          <div className="mt-4 sm:mt-6 space-y-4 w-full flex flex-col items-center">
            {grantProposals.map(grant => (
              <Proposal
                key={grant.id}
                proposal={grant}
                userSubmissionsAmount={submissionsByBuilderAddress[grant.builderAddress]}
                isGrant
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center p-4 sm:p-6 bg-[#F3E6FB] rounded-xl">
          <h2 className="text-2xl font-bold !m-0">New Stage Proposals ({stageProposals.length})</h2>
          <div className="mt-4 sm:mt-6 space-y-4 w-full flex flex-col items-center">
            {stageProposals.map(grant => (
              <Proposal
                key={grant.id}
                proposal={grant}
                userSubmissionsAmount={submissionsByBuilderAddress[grant.builderAddress]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
