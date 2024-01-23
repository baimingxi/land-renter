import { AptosClient } from '@/config';
import { Account, AccountAddress, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

const DEFAULT_INVITER_ADDRESS = AccountAddress.from('0x1').toStringLong();
const CONTRACT_MODULE_GENERATOR = (
  func: `${string}::${string}`,
): `${string}::${string}::${string}` =>
  `${import.meta.env.VITE_APP_LAND_CONTRACT_ADDRESS}::${func}`;

interface BidOnSupportTicketsArgs {
  epochId: number;
  amount: number | string;
  account: any;
}
interface BidOnAPTSArgs extends BidOnSupportTicketsArgs {
  object_ids: string[];
  inviter?: string;
}

const useLand = () => {
  const preapreAccountWithPrivateKey = async (privateKey: any) => {
    const prik = new Ed25519PrivateKey(privateKey);
    return Account.fromPrivateKey({
      privateKey: prik,
    });
  };

  const getLiveEpochId = async () => {
    const result: any = await AptosClient.view({
      payload: {
        function: CONTRACT_MODULE_GENERATOR('auction::get_live_epoch_id'),
        functionArguments: [],
      },
    });
    return result?.[0]?.vec?.[0] || '';
  };

  const bidOnAPTS = async (args: BidOnAPTSArgs) => {
    const account: Account = await preapreAccountWithPrivateKey(args.account.privateKey);

    const transaction = await AptosClient.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: CONTRACT_MODULE_GENERATOR('bid::bid_on_apts'),
        typeArguments: [],
        functionArguments: [
          // epoch_id: u64,
          args.epochId,
          // apts_objects: vector<address>,
          args.object_ids,
          // amount: u128,
          args.amount,
          // inviter: address
          DEFAULT_INVITER_ADDRESS,
        ],
      },
      options: {
        maxGasAmount: 10000,
      },
    });

    const [userTransactionResponse] = await AptosClient.transaction.simulate.simple({
      signerPublicKey: account.publicKey,
      transaction,
    });

    if (!userTransactionResponse.success) {
      throw new Error(userTransactionResponse.vm_status);
    }

    // using signAndSubmit combined
    const committedTransaction = await AptosClient.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    await AptosClient.waitForTransaction({ transactionHash: committedTransaction.hash });

    return {
      address: account.accountAddress.toString(),
      transactionHash: committedTransaction.hash,
    };
  };

  return {
    getLiveEpochId,
    bidOnAPTS,
  };
};

export default useLand;

