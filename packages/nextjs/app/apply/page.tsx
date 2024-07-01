"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateNewGrantReqBody } from "../api/grants/new/route";
import { useMutation } from "@tanstack/react-query";
import type { NextPage } from "next";
import { useAccount, useSignTypedData } from "wagmi";
import { EIP_712_DOMAIN, EIP_712_TYPES__APPLY_FOR_GRANT } from "~~/utils/eip712";
import { postMutationFetcher } from "~~/utils/react-query";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const MAX_DESCRIPTION_LENGTH = 750;

const Apply: NextPage = () => {
  const [descriptionLength, setDescriptionLength] = useState(0);
  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();
  const { address: connectedAddress } = useAccount();
  const router = useRouter();

  const { mutateAsync: postNewGrant, isPending: isPostingNewGrant } = useMutation({
    mutationFn: (newGrant: CreateNewGrantReqBody) => postMutationFetcher("/api/grants/new", { body: newGrant }),
  });

  const handleFormAction = async (formData: FormData) => {
    try {
      if (!connectedAddress) return notification.error("Please connect your wallet");

      const title = formData.get("title") as string | undefined;
      const description = formData.get("description") as string | undefined;
      if (!title || !description) return notification.error("Please fill all the fields");

      const signature = await signTypedDataAsync({
        domain: EIP_712_DOMAIN,
        types: EIP_712_TYPES__APPLY_FOR_GRANT,
        primaryType: "Message",
        message: {
          title: title,
          description: description,
        },
      });

      await postNewGrant({ title, description, builderAddress: connectedAddress, signature });
      router.push("/");
    } catch (error) {
      const errorMessage = getParsedError(error);
      notification.error(errorMessage);
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-12">
      <div className="card card-compact rounded-xl max-w-[95%] w-[500px] bg-secondary shadow-lg mb-12">
        <form action={handleFormAction} className="card-body space-y-3">
          <h2 className="card-title self-center text-3xl !mb-0">Submit Proposal</h2>
          <div className="space-y-2">
            <p className="m-0 text-xl ml-2">Title</p>
            <div className="flex border-2 border-base-300 bg-base-200 rounded-xl text-accent">
              <input
                className="input input-ghost focus-within:border-transparent focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
                placeholder="Proposal title"
                name="title"
                autoComplete="off"
                type="text"
                maxLength={75}
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="m-0 text-xl ml-2">Description</p>
            <div className="flex flex-col border-2 border-base-300 bg-base-200 rounded-xl text-accent">
              <textarea
                className="input input-ghost focus-within:border-transparent focus:outline-none focus:bg-transparent focus:text-gray-400 px-4 pt-2 border w-full font-medium placeholder:text-accent/50 text-gray-400 h-28 md:h-52 rounded-none"
                placeholder="Proposal description"
                name="description"
                autoComplete="off"
                maxLength={MAX_DESCRIPTION_LENGTH}
                onChange={e => setDescriptionLength(e.target.value.length)}
              />
              <p className="my-1">
                {descriptionLength} / {MAX_DESCRIPTION_LENGTH}
              </p>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={isPostingNewGrant || isSigning}>
            {(isPostingNewGrant || isSigning) && <span className="loading loading-spinner"></span>}
            APPLY FOR A GRANT
          </button>
        </form>
      </div>
    </div>
  );
};

export default Apply;
