import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <Link className="btn btn-primary" href="/apply">
          Apply
        </Link>
      </div>
    </>
  );
};

export default Home;
