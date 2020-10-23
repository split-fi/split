import { task } from "@nomiclabs/buidler/config";

type TokenAddresses = { [symbol: string]: string };

interface Args {
  tokenSymbol: string;
  allocateTo?: string;
  amount?: string;
}

const networkToToken: { [network: string]: TokenAddresses } = {
  rinkeby: {
    USDC: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
    BAT: "0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99",
    ZRX: "0xddea378A6dDC8AfeC82C36E9b0078826bf9e68B6",
  },
};

const abi = [
  {
    constant: false,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
      {
        name: "value",
        type: "uint256",
      },
    ],
    name: "allocateTo",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x08bca566",
  },
];

task("mint_test_token", "mints tokens on testnets")
  .addParam("tokenSymbol", "The token to mint")
  .addOptionalParam("allocateTo", "The address to allocate the tokens to")
  .addOptionalParam("amount", "How much to mint")
  .setAction(async (args: Args, bre) => {
    const tokens = networkToToken[bre.network.name];
    if (!tokens) {
      console.warn(`Could not find token addresses for network ${bre.network}`);
    }
    const address = tokens[args.tokenSymbol];
    if (!address) {
      console.warn(`Could not find token address for token symbol ${args.tokenSymbol}`);
    }
    const [signer] = await bre.ethers.getSigners();
    const faucet = new bre.ethers.Contract(address, abi, signer);
    const txn = await faucet.allocateTo(args.allocateTo || (await signer.getAddress()), args.amount || "100000000000");
    console.log(`Allocation tx: ${txn.hash}`);
  });
