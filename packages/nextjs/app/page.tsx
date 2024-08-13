import { WorkflowItem } from "./_components/WorkflowItem";
import { Stats } from "./_components/stats";
import type { NextPage } from "next";
import { Button } from "~~/components/pg-ens/Button";

// TODO: descriptions
const workflowItems = [
  {
    title: "Apply for a grant",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ut metus eget ipsum dapibus imperdiet. Phasellus varius enim  in est ornare, non bibendum purus",
  },
  {
    title: "Review process",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ut metus eget ipsum dapibus imperdiet. Phasellus varius enim  in est ornare, non bibendum purus",
  },
  {
    title: "Deliver your milestones",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ut metus eget ipsum dapibus imperdiet. Phasellus varius enim  in est ornare, non bibendum purus",
  },
  {
    title: "Apply for another stage",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ut metus eget ipsum dapibus imperdiet. Phasellus varius enim  in est ornare, non bibendum purus",
  },
];

const Home: NextPage = () => {
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

      <div className="bg-secondary py-10 sm:py-20 px-4 flex flex-col items-center w-full">
        <h2 className="text-3xl font-black !mb-0">How does it work</h2>

        <div className="my-12 grid text-sm sm:grid-cols-2 xl:grid-cols-4 max-w-7xl gap-8">
          {workflowItems.map(({ title, description }, idx) => (
            <WorkflowItem key={title} step={idx + 1} title={title} description={description} />
          ))}
        </div>
        <Button link href="/apply">
          Apply for a grant
        </Button>
      </div>
    </div>
  );
};

export default Home;
