import Decimal from "decimal.js";
import React, { FC, useCallback, useMemo, useState } from "react";
import { useTable, useFlexLayout, useResizeColumns } from "react-table";
import styled from "styled-components";

import { HeaderTR, TableContainer, TBody, TCell, TCellHeader, TR, TCellLabel, TCellContent } from "./common";
import { Asset, FullAsset } from "../../types/split";
import { formatTokenAmount } from "../../utils/number";
import { PrimaryButton } from "../button";
import { ZERO } from "../../constants";
import { useAssetBalances } from "../../contexts/asset-balances";
import { useTransaction, useTransactionActions, useTransactionsMap } from "../../contexts/transaction";
import { useYieldBalances } from "../../contexts/yield-balances";
import { Faded } from "../typography";
import { useFullTokens } from "../../contexts/tokens";
import { useYieldTokenContracts } from "../../hooks/contracts";
import { YieldComponentToken } from "split-contracts/typechain/YieldComponentToken";
import { TransactionObject, TransactionStatus } from "../../types/app";
import Link from "next/link";
import { getEtherscanLink } from "../../utils/etherscan";
import { ArrowRight, Check, CheckCircle, Circle, ExternalLink, XCircle } from "react-feather";
import { stat } from "fs";
import { shortenHexString } from "../../utils/address";

const DarkHeaderTr = styled(HeaderTR)`
  border-color: rgba(0, 0, 0, 0.05);
  border-width: 2px;
`;

const DarkTCell = styled(TCell)`
  color: black;
  padding: 4px 0;
  height: 44px;
  border-color: rgba(0, 0, 0, 0.05);
  border-width: 2px;
`;

const DarkTR = styled(TR)`
  border-color: black;
`;

const StatusWrapper = styled.div`
  padding-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export interface TxTableProps {}

const TX_TABLE_SCHEMA = [
  {
    Header: "",
    accessor: "status",
    id: "status",
    width: 28,
    maxWidth: 28,
    minWidth: 28,
    disableResizing: true,
  },
  {
    Header: "",
    accessor: "metadata",
    id: "description",
  },
  {
    Header: "",
    accessor: "link",
    id: "link",
    width: 16,
    maxWidth: 16,
    minWidth: 16,
    disableResizing: true,
  },
];

export interface YieldTableProps {
  data: Array<TransactionObject>;
}

const StatusDescriptionWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StatusDescription: React.FC<{ metadata: any; txHash: string }> = ({ metadata, txHash }) => {
  console.log(metadata);
  if (metadata.type === "withdraw") {
    return (
      <StatusDescriptionWrapper>
        {`withdrew ${formatTokenAmount(metadata.withdrawTokenAmount, metadata.withdrawToken).minimizedWithUnits}`}
      </StatusDescriptionWrapper>
    );
  }
  if (metadata.type === "approve") {
    return <StatusDescriptionWrapper>{`approved ${metadata.token.symbol}`}</StatusDescriptionWrapper>;
  }
  if (metadata.type === "split") {
    const { yieldComponentToken, capitalComponentToken } = metadata.fullToken.componentTokens;
    return (
      <StatusDescriptionWrapper>
        {`${formatTokenAmount(metadata.fullTokenAmount, metadata.fullToken).minimized} ${metadata.fullToken.symbol}`}
        <ArrowRight width={16} height={16} style={{ margin: "0 6px" }} />
        {`${capitalComponentToken.symbol}, ${yieldComponentToken.symbol}`}
      </StatusDescriptionWrapper>
    );
  }
  if (metadata.type === "combine") {
    const { yieldComponentToken, capitalComponentToken } = metadata.fullToken.componentTokens;
    return (
      <StatusDescriptionWrapper>
        {`${formatTokenAmount(metadata.componentTokenAmount, capitalComponentToken).minimized} ${
          capitalComponentToken.symbol
        }, ${yieldComponentToken.symbol}`}
        <ArrowRight width={16} height={16} style={{ margin: "0 6px" }} />
        {`${metadata.fullToken.symbol}`}
      </StatusDescriptionWrapper>
    );
  }
  return <StatusDescriptionWrapper>{shortenHexString(txHash)}</StatusDescriptionWrapper>;
};

const StatusIndicator: React.FC<{ status: TransactionStatus }> = ({ status }) => {
  if (status === "failed") {
    return <XCircle width={18} height={18} />;
  }
  if (status === "success") {
    return <CheckCircle width={18} height={18} />;
  }
  return <Circle width={18} height={18} />;
};

const Table: React.FC<YieldTableProps> = ({ data }) => {
  const { getTableProps, rows, prepareRow } = useTable(
    {
      columns: TX_TABLE_SCHEMA,
      data,
    },
    useResizeColumns,
    useFlexLayout,
  );

  return (
    <div {...getTableProps()}>
      <TBody>
        <DarkHeaderTr></DarkHeaderTr>
        {rows.map(row => {
          prepareRow(row);
          const { txHash, status, chainId, metadata } = row.original as TransactionObject;
          return (
            <DarkTR key={txHash} {...(row.getRowProps() as any)}>
              {row.cells.map(cell => {
                if (cell.column.id === "status") {
                  return (
                    <DarkTCell {...cell.getCellProps()}>
                      <TCellContent>
                        <StatusWrapper>
                          <StatusIndicator status={status} />
                        </StatusWrapper>
                      </TCellContent>
                    </DarkTCell>
                  );
                }
                if (cell.column.id === "description") {
                  return (
                    <DarkTCell {...cell.getCellProps()}>
                      <StatusDescription metadata={metadata} txHash={txHash} />
                    </DarkTCell>
                  );
                }
                if (cell.column.id === "link") {
                  return (
                    <DarkTCell {...cell.getCellProps()}>
                      <Link href={getEtherscanLink(chainId, txHash, "transaction")}>
                        <ExternalLink style={{ cursor: "pointer" }} stroke="black" width={16} height={16} />
                      </Link>
                    </DarkTCell>
                  );
                }
                return <div {...cell.getCellProps()}>{cell.render("Cell")}</div>;
              })}
            </DarkTR>
          );
        })}
      </TBody>
    </div>
  );
};

const TxTable: React.FC<TxTableProps> = ({}) => {
  const txMap = useTransactionsMap();
  const data = Object.values(txMap);

  return (
    <>
      <TableContainer>
        <Table data={data} />
      </TableContainer>
    </>
  );
};

export { TxTable };
