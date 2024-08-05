"use client";

import { ReactNode } from "react";
import { Stage } from "~~/services/database/repositories/stages";
import { multilineStringToTsx } from "~~/utils/multiline-string-to-tsx";

type GrantDetailsFieldProps = {
  title: string;
  description: ReactNode | Array<Stage>;
};

export const GrantDetailsField = ({ title, description }: GrantDetailsFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-bold text-xl">{title}</span>
      <div className="flex flex-col">
        {Array.isArray(description)
          ? // stage milestones
            description.map(stage => (
              <div key={stage.id}>
                <div className="font-bold text-lg">Stage {stage.stageNumber}</div>
                <div>{multilineStringToTsx(stage.milestone || "-")}</div>
              </div>
            ))
          : typeof description === "string"
          ? multilineStringToTsx(description)
          : description}
      </div>
    </div>
  );
};
