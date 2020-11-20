export interface ComponentSet {
  capitalComponentTokenAddress: string;
  yieldComponentTokenAddress: string;
}

export type ComponentSets = { [fullToken: string]: ComponentSet };

export interface Deployment {
  splitVaultAddress: string;
  priceOracleAddress: string;
  componentSets: ComponentSets;
}

export type Deployments = { [network: string]: Deployment };
