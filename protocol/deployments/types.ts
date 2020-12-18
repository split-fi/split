export interface ComponentSet {
  capitalComponentTokenAddress: string;
  yieldComponentTokenAddress: string;
}

export interface SplitPool {
  poolAddress: string;
}

export type ComponentSets = { [fullToken: string]: ComponentSet };
export type SplitPools = { [fullToken: string]: SplitPool };
export interface Libraries {
  // name -> address
  [libraryName: string]: string;
}

export interface Deployment {
  balancerSmartPoolFactoryAddress: string;
  balancerPoolFactoryAddress: string;
  splitVaultAddress: string;
  priceOracleAddress: string;
  componentSets: ComponentSets;
  splitPoolFactoryAddress: string;
  usdcAddress: string;
  compAddress: string;
  splitPools: SplitPools;
  libraries: Libraries;
}

export type Deployments = { [network: string]: Deployment };
