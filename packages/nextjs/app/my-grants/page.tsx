import { GrantsList } from "./GrantsList";
import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import { SignInBtn } from "~~/components/pg-ens/SignInBtn";
import { authOptions } from "~~/utils/auth";

export const revalidate = 0;

const MyGrants: NextPage = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center px-4 py-10 sm:py-20">
      <h1 className="text-3xl text-center font-extrabold mb-8">My Grants</h1>
      {!session?.user ? (
        <div className="flex flex-col items-center justify-center">
          <p className="mb-6">You need to sign in to view your grants.</p>
          <SignInBtn />
        </div>
      ) : (
        <GrantsList />
      )}
    </div>
  );
};

export default MyGrants;
