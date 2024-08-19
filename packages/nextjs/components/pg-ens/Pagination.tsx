import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button } from "~~/components/pg-ens/Button";

type PaginationProps = {
  currentListPage: number;
  setCurrentListPage: (nextListPage: number) => void;
  itemsAmount: number;
  itemsPerPage: number;
};

export const Pagination = ({ currentListPage, setCurrentListPage, itemsAmount, itemsPerPage }: PaginationProps) => {
  const pagesAmount = Math.ceil(itemsAmount / itemsPerPage);
  const hasNextListPage = currentListPage < pagesAmount;

  const setNextListPage = () => {
    if (hasNextListPage) {
      setCurrentListPage(currentListPage + 1);
    }
  };

  const hasPrevListPage = currentListPage > 1;
  const setPrevListPage = () => {
    if (hasPrevListPage) {
      setCurrentListPage(currentListPage - 1);
    }
  };
  return (
    (hasPrevListPage || hasNextListPage) && (
      <div className="flex items-center justify-end gap-2 w-full max-w-screen-2xl">
        {hasPrevListPage ? (
          <Button className="!p-1 rounded-full w-7 h-7 min-h-0" onClick={setPrevListPage}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
        ) : (
          // prevent pagination jump
          <div className="w-7" />
        )}
        <span className="text-primary font-bold">
          Page {currentListPage} of {pagesAmount}
        </span>
        {hasNextListPage ? (
          <Button className="!p-1 rounded-full w-7 h-7 min-h-0" onClick={setNextListPage}>
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        ) : (
          // prevent pagination jump
          <div className="w-7" />
        )}
      </div>
    )
  );
};
