import { MyGrantsList } from "./MyGrantsList";
import { NextPage } from "next";

const MyGrants: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10 space-y-4">
      <h1 className="text-2xl p-0">My grants</h1>
      <MyGrantsList />
    </div>
  );
};

export default MyGrants;
