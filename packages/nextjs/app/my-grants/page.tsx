import { GrantsList } from "./GrantsList";
import { NextPage } from "next";

const MyGrants: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10 px-4">
      <h1 className="text-3xl font-extrabold mb-10">My grants</h1>
      <GrantsList />
    </div>
  );
};

export default MyGrants;
