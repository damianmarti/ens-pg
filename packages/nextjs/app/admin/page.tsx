import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { getAllGrants } from "~~/services/database/repositories/grants";

const Admin: NextPage = async () => {
  const allGrants = await getAllGrants();
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10 space-y-4">
        {allGrants.map(grant => {
          return (
            <div key={grant.id}>
              <div className="card bg-primary text-primary-content w-96">
                <div className="card-body">
                  <h2 className="card-title">{grant.title}</h2>
                  <p>{grant.description}</p>
                  <Address address={grant.builderAddress} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Admin;
