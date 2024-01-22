<template>
  <div class="page-container px-4">
    <h1 class="text-8 font-bold py-8">Land Renter 💰</h1>

    <div>
      <Input type="file" placeholder="" accept=".json" @change="fileChange" />
    </div>

    <div class="my-5 max-h-100 overflow-y-auto">
      <div class="flex-col gap-1">
        <div
          class="flex-col gap-2 rounded-2 overflow-hidden text-sm"
          v-for="(account, index) in accountList"
          :key="index"
        >
          <div
            class="bg-primary/5 hover:bg-primary/10 p-4 py-2 flex flex-col lg:flex-row justify-between"
          >
            <a
              class="underline break-all"
              target="_blank"
              :href="`https://explorer.aptoslabs.com/account/${account.address}?network=${network}`"
            >
              {{ index + 1 }}.
              {{ account.address }}
            </a>
            <span>
              <span>
                Balance:
                <span class="font-bold">
                  {{ PriceWithDecimal(account.balance || 0) }}
                </span>
                APT
              </span>
              |
              <span>
                APTS:
                <span class="font-bold">
                  {{ NumberFormat(account.aptsBalance || 0) }}
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <h1 class="text-5 font-bold">Current Epoch: {{ currentEpochId }} -> {{ toCurrenEpochEnd }}</h1>
  </div>
</template>

<script lang="ts" setup>
  import useContract from '@/hooks/useContract';
  import useLand from '@/hooks/useLand';
  import useLandGraphQL from '@/hooks/useLandGraphQL';
  import { NumberFormat, PriceWithDecimal } from '@/utils/index';
  import { message } from 'ant-design-vue';
  import BigNumber from 'bignumber.js';
  import dayjs from 'dayjs';
  import numeral from 'numeral';

  const { getBalance, getAPTSBalance } = useContract();
  const { getLiveEpochId } = useLand();
  const { getLandEpochInfo } = useLandGraphQL();
  const timestamp = useTimestamp({ offset: 0 });

  const network = import.meta.env.VITE_APP_NETWORK;
  const accountList = ref<any[]>([]);

  const fileChange = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      try {
        accountList.value = JSON.parse(text as string);
      } catch (e: any) {
        console.log(e);
        message.error(e.message);
      }
    };
    reader.readAsText(file);
  };

  const basicInfoOfAccount = async () => {
    if (accountList.value?.length === 0) {
      return;
    }

    accountList.value.forEach(async (account: any, index: number) => {
      try {
        const balance = await getBalance(account.address);
        accountList.value[index].balance = balance;
      } catch {}

      try {
        const aptsBalance = await getAPTSBalance(account.address);
        accountList.value[index].aptsBalance = aptsBalance;
      } catch {}
    });
  };

  const currentEpochId = ref<number>(0);
  const currentEpochInfo = ref<any>({});
  const epochDuration = 60 * 10;

  const toCurrenEpochEnd = computed(() => {
    const startTimeObj = currentEpochInfo.value?.startTime;
    if (!startTimeObj) {
      return numeral(0).format('00:00:00');
    }

    const startTime: any = Math.floor(dayjs(startTimeObj)?.valueOf() / 1e3);
    const ts = Math.floor(timestamp.value / 1e3);
    const endTime = new BigNumber(startTime).plus(epochDuration).toNumber();

    return numeral(endTime - ts).format('00:00:00:00');
  });

  const init = async () => {
    currentEpochId.value = await getLiveEpochId();
    const result: any = await getLandEpochInfo(currentEpochId.value);
    currentEpochInfo.value = result?.data?.getLandEpochInfo;
  };

  watch(
    () => accountList.value,
    () => {
      basicInfoOfAccount();
    },
    { immediate: true },
  );

  onMounted(() => {
    init();
  });

  // generatedAccounts();
</script>

<route lang="yaml">
meta:
  layout: default
</route>

