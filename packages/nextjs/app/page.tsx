import { Stats } from "./_components/stats";
import { Button } from "~~/components/pg-ens/Button";

const Home = async () => {
  return (
    <div className="flex items-center flex-col flex-grow">
      <div className="max-w-4xl text-center px-4 py-10 sm:py-20">
        <h1 className="text-3xl font-extrabold !mb-0">ENS PG Builder Grants</h1>
        <div className="mt-4 text-gray-400 max-w-lg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ut metus eget ipsum dapibus imperdiet. Phasellus
          varius enim in est ornare, non bibendum purus venenatis. Proin consequat elit leo. Nunc maximus mauris id
          luctus tristique.
        </div>
        <Stats />
      </div>
      <Button link href="/apply">
        Apply for a grant
      </Button>
    </div>
  );
};

export default Home;
