import Decimal from "decimal.js";
import React, { FC, useCallback, useMemo, useState } from "react";
import { useTable } from "react-table";
import styled from "styled-components";

import { HeaderTR, TableContainer, TBody, TCell, TCellHeader, TR, TCellLabel } from "./common";
import { Asset, FullAsset } from "../../types/split";
import { formatTokenAmount } from "../../utils/number";
import { PrimaryButton } from "../button";
import { ZERO } from "../../constants";
import { useAssetBalances } from "../../contexts/asset-balances";
import { useTransaction, useTransactionActions } from "../../contexts/transaction";
import { useYieldBalances } from "../../contexts/yield-balances";
import { Faded } from "../typography";
import { useFullTokens } from "../../contexts/tokens";
import { useYieldTokenContracts } from "../../hooks/contracts";
import { YieldComponentToken } from "split-contracts/typechain/YieldComponentToken";

type Filter = "capital-split" | "yield-split";

export interface AssetsTableProps {
  filter: Filter;
}

const CAPITAL_TABLE_SCHEMA = [
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
];

const YIELD_TABLE_SCHEMA = CAPITAL_TABLE_SCHEMA.concat([
  {
    Header: "",
    accessor: "type",
    id: "withdraw",
  },
]);

export interface YieldTableProps {
  data: Array<ComponentTokenWithFullAndBalance>;
}

const YieldTable: React.FC<YieldTableProps> = ({ data }) => {
  const { getTableProps, rows, prepareRow } = useTable({
    columns: YIELD_TABLE_SCHEMA,
    data,
  });

  const yieldContracts = useYieldTokenContracts(
    data.map(t => t.fullToken.componentTokens.yieldComponentToken.tokenAddress),
  );
  const yieldContractByAddress = useMemo(
    () =>
      yieldContracts.reduce((a: any, c: YieldComponentToken) => {
        return {
          ...a,
          [c.address]: c,
        };
      }, {} as { [address: string]: YieldComponentToken }),
    [yieldContracts],
  );

  return (
    <div {...getTableProps()}>
      <TBody>
        <HeaderTR></HeaderTR>
        {rows.map(row => {
          prepareRow(row);
          const {
            fullToken,
            componentToken,
            balanceOfComponent,
            yieldOfComponent,
          } = row.original as ComponentTokenWithFullAndBalance;
          return (
            <TR key={fullToken.tokenAddress} {...(row.getRowProps() as any)}>
              {row.cells.map(cell => {
                if (cell.column.id === "amount") {
                  return (
                    <TCell {...cell.getCellProps()}>
                      <TCellHeader>
                        {formatTokenAmount(balanceOfComponent, componentToken).minimizedWithUnits}
                      </TCellHeader>
                    </TCell>
                  );
                }
                if (cell.column.id === "worth") {
                  return (
                    <TCell {...cell.getCellProps()} style={{ flexDirection: "row-reverse" }}>
                      <TCellLabel>
                        withdraw {formatTokenAmount(yieldOfComponent, fullToken).minimizedWithUnits}
                      </TCellLabel>
                    </TCell>
                  );
                }
                if (cell.column.id === "withdraw") {
                  return (
                    <>
                      <TCell {...cell.getCellProps()} style={{ flexDirection: "row-reverse" }}>
                        <WidthdrawAction
                          withdrawToken={componentToken}
                          withdrawTokenAmount={yieldOfComponent}
                          withdrawContract={yieldContractByAddress[componentToken.tokenAddress]}
                        />
                      </TCell>
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

export interface CapitalTableProps {
  data: Array<ComponentTokenWithFullAndBalance>;
}

const CapitalTable: React.FC<CapitalTableProps> = ({ data }) => {
  const { getTableProps, rows, prepareRow } = useTable({
    columns: CAPITAL_TABLE_SCHEMA,
    data,
  });

  return (
    <div {...getTableProps()}>
      <TBody>
        <HeaderTR></HeaderTR>
        {rows.map(row => {
          prepareRow(row);
          const { fullToken, componentToken, balanceOfComponent } = row.original as ComponentTokenWithFullAndBalance;
          return (
            <TR key={fullToken.tokenAddress} {...(row.getRowProps() as any)}>
              {row.cells.map(cell => {
                if (cell.column.id === "amount") {
                  return (
                    <TCell {...cell.getCellProps()}>
                      <TCellHeader>
                        {formatTokenAmount(balanceOfComponent, componentToken).minimizedWithUnits}
                      </TCellHeader>
                    </TCell>
                  );
                }
                if (cell.column.id === "worth") {
                  // TODO(fragosti): Need a better way of doing this. HACK.
                  return (
                    <TCell {...cell.getCellProps()} style={{ flexDirection: "row-reverse" }}>
                      <TCellLabel>
                        worth{" "}
                        {`${formatTokenAmount(balanceOfComponent, componentToken).minimized} ${
                          fullToken.underlyingAssetSymbol
                        }`}
                      </TCellLabel>
                    </TCell>
                  );
                }
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
  withdrawTokenAmount: Decimal;
  withdrawToken: Asset;
  withdrawContract: YieldComponentToken | undefined;
}

const WidthdrawAction: FC<WidthdrawActionProps> = ({ withdrawContract, withdrawTokenAmount, withdrawToken }) => {
  const [txHash, setWithdrawTxHash] = useState<string | undefined>(undefined);
  const { addTransaction } = useTransactionActions();
  const transactionObject = useTransaction(txHash);

  const onWithdrawClick = useCallback(async () => {
    const tx = await withdrawContract.withdrawYield();
    addTransaction(tx.hash, {
      withdrawTokenAmount,
      withdrawToken,
      type: "withdraw",
    });
  }, [withdrawContract, withdrawTokenAmount, withdrawToken]);

  return (
    <WithdrawActionWrapper>
      {!!transactionObject ? (
        <TCellLabel>
          <Faded>Withdrawing...</Faded>
        </TCellLabel>
      ) : (
        <>{withdrawContract && <PrimaryButton onClick={onWithdrawClick}>Withdraw</PrimaryButton>}</>
      )}
    </WithdrawActionWrapper>
  );
};

export interface ComponentTokenWithFullAndBalance {
  fullToken: FullAsset;
  componentToken: Asset;
  balanceOfComponent: Decimal;
  yieldOfComponent: Decimal;
}

const AssetsTable: React.FC<AssetsTableProps> = ({ filter }) => {
  const fullTokens = useFullTokens();
  const tokenBalances = useAssetBalances();
  const yieldBalances = useYieldBalances();
  const isCapitalSplit = filter === "capital-split";
  const data = fullTokens.map(fullToken => {
    const componentToken = isCapitalSplit
      ? fullToken.componentTokens.capitalComponentToken
      : fullToken.componentTokens.yieldComponentToken;
    return {
      fullToken,
      componentToken,
      balanceOfComponent: tokenBalances[componentToken.tokenAddress] ?? ZERO,
      yieldOfComponent: yieldBalances[componentToken.tokenAddress] ?? ZERO,
    };
  });
  return (
    <>
      <TableContainer>
        {isCapitalSplit ? <CapitalTable data={data ?? []} /> : <YieldTable data={data ?? []} />}
      </TableContainer>
    </>
  );
};

export { AssetsTable };
