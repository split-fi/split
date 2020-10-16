export {};

// declare module "fortmatic";

declare global {
  // Merges default window declarations with custom ones below
  interface Window {
    ethereum?: {
      isMetaMask?: true;
      on?: (...args: any[]) => void;
      removeListener?: (...args: any[]) => void;
    };
    web3?: {};
  }
}
