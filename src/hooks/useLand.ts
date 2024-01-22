import { AptosClient } from '@/config';

const CONTRACT_MODULE_GENERATOR = (
  func: `${string}::${string}`,
): `${string}::${string}::${string}` =>
  `${import.meta.env.VITE_APP_LAND_CONTRACT_ADDRESS}::${func}`;

const useLand = () => {
  const getLiveEpochId = async () => {
    const result: any = await AptosClient.view({
      payload: {
        function: CONTRACT_MODULE_GENERATOR('auction::get_live_epoch_id'),
        functionArguments: [],
      },
    });
    return result?.[0]?.vec?.[0] || '';
  };

  return {
    getLiveEpochId,
  };
};

export default useLand;

