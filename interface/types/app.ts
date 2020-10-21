import { TransactionReceipt } from "@ethersproject/providers";
import Decimal from "decimal.js";
import { Component } from "react";
import { Asset, FullAsset } from "./split";

/**
 * Application state related types
 */

export enum AppModal {
  WALLET = "WALLET",
}

export enum AppAction {
  SPLIT = "SPLIT",
  MANAGE = "MANAGE",
  COMBINE = "COMBINE",
}

export type BannerType = "loading" | "success" | "error" | "default";

export interface BannerMetadata {
  description: string;
  type: BannerType;
  dismissed: boolean;
}

export interface TxBannerMetadata extends BannerMetadata {
  txHash: string;
}

export interface ApproveTransactionMetadata {
  tokenAmount: Decimal;
  token: Asset;
}

export interface SplitTransactionMetadata {
  fullToken: FullAsset;
  fullTokenAmount: Decimal;
  type: 'split';
}

export interface CombineTransactionMetadata {
  fullToken: FullAsset;
  componentTokenAmount: Decimal;
  type: 'combine';
}

export interface WithdrawTransactionMetadata {
  widthdrawTokenAmount: Decimal;
  withdrawToken: Asset;
  type: 'withdraw';
}

export type TransactionMetadata = ApproveTransactionMetadata | SplitTransactionMetadata | WithdrawTransactionMetadata | CombineTransactionMetadata;

export type TransactionStatus = "in-progress" | "success" | "failed";

export interface TransactionObject {
  chainId: number;
  senderAddress: string;
  txHash: string;
  status: TransactionStatus;
  metadata?: TransactionMetadata;
  receipt?: TransactionReceipt;
  lastBlockNumChecked?: number;
}
