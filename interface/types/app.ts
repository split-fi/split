import { TransactionReceipt } from "@ethersproject/providers";

/**
 * Application state related types
 */

export enum AppModal {
  WALLET = "WALLET",
}

export enum AppAction {
  SPLIT = "SPLIT",
  COMBINE = "COMBINE",
  MANAGE = "MANAGE",
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

export interface SplitTransactionMetadata {}

export type TransactionMetadata = SplitTransactionMetadata;

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
