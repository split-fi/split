// TODO(johnrjj) - Consolidate this file with ActiveTradesTable eventually. Separate right now to move faster.
import React, { FC, useState } from "react";
import { useTable } from "react-table";
import Decimal from "decimal.js";
import { HeaderTR, TableContainer, TBody, TCell, TCellHeader, TR, TCellLabel } from "./common";
import { Asset } from "../../types/split";
import { formatTokenAmount } from "../../utils/format";
import { PrimaryButton, SecondaryButton } from "../button";
import styled from "styled-components";
import { WithRouterProps } from "next/dist/client/with-router";
import { useTransaction, useTransactionActions } from "../../contexts/transaction";
import { Faded } from "../typography";

export interface AssetWithMarketInfo extends Asset {
  tokenAmount: Decimal;
  redeemableTokenAmount: Decimal; // work on naming this better
  redeemableAsset: Asset;
}

export interface AssetsTableProps {
  tokens: Array<AssetWithMarketInfo> | undefined;
}

const TABLE_SCHEMA = [
  {
    Header: "Amount",
    accessor: "tokenAmount",
    id: "amount",
  },
  {
    Header: "Worth",
    accessor: "redeemableTokenAmount",
    id: "worth",
  },
  {
    Header: "",
    accessor: "type",
    id: "withdraw",
  },
];

export interface TableProps {
  columns: any;
  data: Array<Asset>;
}
// Sourced from https://codesandbox.io/s/github/tannerlinsley/react-table/tree/master/examples/full-width-table
const Table: React.FC<TableProps> = ({ columns, data }) => {
  const { getTableProps, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <div {...getTableProps()}>
      <TBody>
        <HeaderTR></HeaderTR>
        {rows.map(row => {
          prepareRow(row);
          const asset = row.original as AssetWithMarketInfo;
          return (
            <TR {...(row.getRowProps() as any)}>
              {row.cells.map(cell => {
                if (cell.column.id === "amount") {
                  return (
                    <TCell {...cell.getCellProps()}>
                      <TCellHeader>{formatTokenAmount(asset.tokenAmount, asset).minimizedWithUnits}</TCellHeader>
                    </TCell>
                  );
                }
                if (cell.column.id === "worth") {
                  return (
                    <TCell {...cell.getCellProps()} style={{ flexDirection: "row-reverse" }}>
                      <TCellLabel>
                        worth {formatTokenAmount(asset.redeemableTokenAmount, asset.redeemableAsset).minimizedWithUnits}
                      </TCellLabel>
                    </TCell>
                  );
                }
                if (cell.column.id === "withdraw") {
                  return (
                    <>
                      {asset.type === "yield-split" && (
                        <TCell {...cell.getCellProps()} style={{ flexDirection: "row-reverse" }}>
                          <WidthdrawAction tokenAddress={asset.tokenAddress} />
                        </TCell>
                      )}
                    </>
                  );
                }
                return <div {...cell.getCellProps()}>{cell.render("Cell")}</div>;
              })}
            </TR>
          );
        })}
      </TBody>
    </div>
  );
};

const WithdrawActionWrapper = styled.div``;

interface WidthdrawActionProps {
  tokenAddress: string;
}

const WidthdrawAction: FC<WidthdrawActionProps> = ({ tokenAddress }) => {
  const [txHash, setWithdrawTxHash] = useState<string | undefined>(undefined);
  const { addTransaction } = useTransactionActions();
  const transactionObject = useTransaction(txHash);
  return (
    <WithdrawActionWrapper>
      {!!transactionObject ? (
        <TCellLabel>
          <Faded>Withdrawing...</Faded>
        </TCellLabel>
      ) : (
        <SecondaryButton>Withdraw</SecondaryButton>
      )}
    </WithdrawActionWrapper>
  );
};

const AssetsTable: React.FC<AssetsTableProps> = ({ tokens }) => {
  return (
    <>
      <TableContainer>
        <Table columns={TABLE_SCHEMA} data={tokens ?? []} />
      </TableContainer>
    </>
  );
};

export { AssetsTable };
