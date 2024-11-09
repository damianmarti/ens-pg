import { QueryHookOptions, QueryResult, gql, useQuery } from "@apollo/client";

export type Withdrawal = {
  amount: string;
  grantId: string;
  grantNumber: number;
  id: string;
  reason: string;
  stageNumber: number;
  timestamp: string;
  to: string;
};

export type WithdrawalItems = Withdrawal[];

export type WithdrawalsData = {
  withdrawals: {
    items: WithdrawalItems;
  };
};

export const WITHDRAWALS_QUERY = gql`
  query GetWithdrawals($filter: WithdrawalFilter, $orderBy: String, $orderDirection: String) {
    withdrawals(where: $filter, orderBy: $orderBy, orderDirection: $orderDirection) {
      items {
        id
        amount
        grantId
        grantNumber
        reason
        to
        stageNumber
        timestamp
      }
    }
  }
`;

type WithdrawalFilter = {
  to?: string;
  grantNumber?: number;
  stageNumber?: number;
  // Add other possible filter fields here
};

type UseWithdrawalsParams = {
  filter?: WithdrawalFilter;
  skip?: boolean;
} & Omit<
  QueryHookOptions<WithdrawalsData, { filter: WithdrawalFilter; orderBy?: string; orderDirection?: string }>,
  "variables" | "skip"
>;

export const useWithdrawals = ({
  filter = {},
  skip: customSkip,
  ...options
}: UseWithdrawalsParams): QueryResult<
  WithdrawalsData,
  { filter: WithdrawalFilter; orderBy?: string; orderDirection?: string }
> => {
  return useQuery<WithdrawalsData, { filter: WithdrawalFilter; orderBy?: string; orderDirection?: string }>(
    WITHDRAWALS_QUERY,
    {
      variables: {
        filter,
        orderBy: "timestamp",
        orderDirection: "asc",
      },
      skip: customSkip || Object.values(filter).every(val => val === undefined),
      ...options,
    },
  );
};
