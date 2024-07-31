import type { NextPage } from "next";
import { Button } from "~~/components/pg-ens/Button";

const Home: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <Button link href="/apply">
        Apply for a grant
      </Button>
    </div>
  );
};

export default Home;
