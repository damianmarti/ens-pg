import { useRouter } from "next/navigation";
import { Button } from "~~/components/pg-ens/Button";
import { useStageReview } from "~~/hooks/pg-ens/useStageReview";
import { Stage } from "~~/services/database/repositories/stages";

type TimelineCompleteButtonProps = { stage: Stage };

export const TimelineCompleteButton = ({ stage }: TimelineCompleteButtonProps) => {
  const router = useRouter();

  const { reviewStage, isSigning, isPostingStageReview } = useStageReview(stage.id);

  return (
    <Button
      disabled={isPostingStageReview || isSigning}
      onClick={async () => {
        await reviewStage({ status: "completed" });
        router.refresh();
      }}
      // TODO: waits #31
      // size='sm'
    >
      {isPostingStageReview || (isSigning && <span className="loading loading-spinner"></span>)}
      Complete
    </Button>
  );
};
