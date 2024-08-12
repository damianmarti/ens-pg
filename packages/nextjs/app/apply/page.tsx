"use client";

import { useRouter } from "next/navigation";
import { CreateNewGrantReqBody } from "../api/grants/new/route";
import { ApplyFormValues, applyFormSchema } from "./schema";
import { useMutation } from "@tanstack/react-query";
import type { NextPage } from "next";
import { FormProvider } from "react-hook-form";
import { useAccount, useSignTypedData } from "wagmi";
import { Button } from "~~/components/pg-ens/Button";
import { FormInput } from "~~/components/pg-ens/form-fields/FormInput";
import { FormSelect } from "~~/components/pg-ens/form-fields/FormSelect";
import { FormTextarea } from "~~/components/pg-ens/form-fields/FormTextarea";
import { useFormMethods } from "~~/hooks/pg-ens/useFormMethods";
import { EIP_712_DOMAIN, EIP_712_TYPES__APPLY_FOR_GRANT } from "~~/utils/eip712";
import { postMutationFetcher } from "~~/utils/react-query";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const Apply: NextPage = () => {
  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();
  const { address: connectedAddress } = useAccount();
  const router = useRouter();
  const { formMethods, getCommonOptions } = useFormMethods<ApplyFormValues>({ schema: applyFormSchema });
  const { handleSubmit } = formMethods;

  const { mutateAsync: postNewGrant, isPending: isPostingNewGrant } = useMutation({
    mutationFn: (newGrant: CreateNewGrantReqBody) => postMutationFetcher("/api/grants/new", { body: newGrant }),
  });

  const onSubmit = async (fieldValues: ApplyFormValues) => {
    try {
      if (!connectedAddress) return notification.error("Please connect your wallet");

      const signature = await signTypedDataAsync({
        domain: EIP_712_DOMAIN,
        types: EIP_712_TYPES__APPLY_FOR_GRANT,
        primaryType: "Message",
        message: {
          ...fieldValues,
          showcaseVideoUrl: fieldValues.showcaseVideoUrl || "",
          twitter: fieldValues.twitter || "",
          telegram: fieldValues.telegram || "",
        },
      });

      await postNewGrant({
        ...fieldValues,
        signature,
      });
      router.push("/my-grants");
    } catch (error) {
      const errorMessage = getParsedError(error);
      notification.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center p-10">
      <h2 className="text-3xl font-extrabold !mb-0">Apply for a grant</h2>

      <FormProvider {...formMethods}>
        <div className="mt-10 card card-compact rounded-xl max-w-4xl w-full bg-secondary shadow-lg mb-12 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="card-body gap-1">
            <FormInput label="Title" {...getCommonOptions("title")} />
            <FormTextarea label="Description" showMessageLength {...getCommonOptions("description")} />
            <FormTextarea label="Planned Milestones" showMessageLength {...getCommonOptions("milestones")} />
            <FormInput label="Showcase Video Url" {...getCommonOptions("showcaseVideoUrl")} />
            <FormSelect
              label="Requested Funds (in ETH)"
              options={["0.25", "0.5", "1", "2"]}
              {...getCommonOptions("requestedFunds")}
            />
            <div className="grid grid-cols-2 gap-x-16 gap-y-1">
              <FormInput label="Github" {...getCommonOptions("github")} />
              <FormInput label="Email address" {...getCommonOptions("email")} />
              <FormInput label="Project or personal twitter" {...getCommonOptions("twitter")} />
              <FormInput label="Telegram handle" {...getCommonOptions("telegram")} />
            </div>
            <Button type="submit" disabled={isPostingNewGrant || isSigning} className="mt-4 self-center">
              {(isPostingNewGrant || isSigning) && <span className="loading loading-spinner"></span>}
              APPLY FOR A GRANT
            </Button>
          </form>
        </div>
      </FormProvider>
    </div>
  );
};

export default Apply;
