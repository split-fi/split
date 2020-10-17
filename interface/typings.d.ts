// Adds ethereum to the window typings
import { Web3Provider } from "@ethersproject/providers";
declare global {
  // Merges default window declarations with custom ones below
  interface Window {
    ethereum: Web3Provider;
  }
}
