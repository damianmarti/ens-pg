"use client";

import { useMemo, useState } from "react";
import { GrantItem } from "../Grants/GrantItem";
import { GrantWithStages } from "~~/app/grants/[grantId]/page";
import { Pagination } from "~~/components/pg-ens/Pagination";

const GRANTS_PER_PAGE = 8;

type AllGrantsListProps = {
  allGrants: NonNullable<GrantWithStages>[];
};

export const AllGrantsList = ({ allGrants }: AllGrantsListProps) => {
  const [currentListPage, setCurrentListPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const maxStage = useMemo(() => {
    return Math.max(...allGrants.flatMap(grant => grant.stages.map(stage => stage.stageNumber)));
  }, [allGrants]);

  const filteredGrants = useMemo(() => {
    return allGrants.filter(grant => {
      const matchesSearch =
        grant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grant.description.toLowerCase().includes(searchQuery.toLowerCase());

      const latestStage = grant.stages[0];

      const matchesStage = stageFilter === "all" || latestStage.stageNumber.toString() === stageFilter;
      const matchesStatus = statusFilter === "all" || latestStage.status === statusFilter;

      return matchesSearch && matchesStage && matchesStatus;
    });
  }, [allGrants, searchQuery, stageFilter, statusFilter]);

  const currentPageGrants = filteredGrants.slice(
    (currentListPage - 1) * GRANTS_PER_PAGE,
    currentListPage * GRANTS_PER_PAGE,
  );

  return (
    <div className="w-full max-w-screen-2xl">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <input
          type="text"
          placeholder="Search grants..."
          className="input input-bordered w-full sm:w-64"
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select
          className="select select-bordered w-full sm:w-64"
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
        >
          <option value="all">All Stages</option>
          {[...Array(maxStage)].map((_, index) => (
            <option key={index + 1} value={(index + 1).toString()}>
              Stage {index + 1}
            </option>
          ))}
        </select>
        <select
          className="select select-bordered w-full sm:w-64"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="proposed">Proposed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8 w-full my-10">
        {currentPageGrants.map(grant => (
          <div key={grant.id} className="flex justify-center">
            <GrantItem grant={grant} latestsShownStatus="all" />
          </div>
        ))}
      </div>

      {filteredGrants.length === 0 && (
        <p className="text-center text-lg font-light mt-8">No grants found matching your criteria.</p>
      )}

      <Pagination
        currentListPage={currentListPage}
        setCurrentListPage={setCurrentListPage}
        itemsAmount={filteredGrants.length}
        itemsPerPage={GRANTS_PER_PAGE}
      />
    </div>
  );
};
