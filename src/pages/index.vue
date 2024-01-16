<template>
  <div class="page-container">
    <h1 class="text-8 font-bold py-8">Land Renter 💰</h1>

    <Form layout="vertical">
      <FormItem label="Private Key">
        <Input v-model:value="privateKeyString" type="password" />
        <div class="flex-col gap-1 py-1">
          <span class="text-sm font-bold text-text/50">
            私钥: {{ ShortAddress(privateKeyString) }}
          </span>
          <span class="text-sm font-bold text-text/50">地址: {{ ShortAddress('0x12323223') }}</span>
        </div>
      </FormItem>

      <FormItem label="初始化子账户">
        <div class="flex-col gap-2">
          <div class="flex gap-2 max-w-100">
            <InputNumber
              v-model:value="initializeAmountOfSubAccount"
              class="w-50"
              :max="150"
              :min="1"
              :controls="false"
              :precision="0"
              placeholder="最小1个, 最大150个"
            />
          </div>
          <div class="flex gap-2 items-center">
            <span>当前子账户数: {{ currentSubAccountAmount }}</span>
            <Button @click="checkSubAccountHandler" :loading="checking">查询子账户</Button>
          </div>
        </div>
      </FormItem>
    </Form>
  </div>
</template>

<script lang="ts" setup>
  import { ShortAddress } from '@/utils';
  import { Button, Form, FormItem, Input, InputNumber, message } from 'ant-design-vue';

  const privateKeyString = ref('');
  const currentSubAccountAmount = ref(0);
  const initializeAmountOfSubAccount = ref(0);

  const subAccountsList = ref<any[]>([]);
  const checking = ref(false);
  const checkSubAccountHandler = async () => {
    if (checking.value) return;
    if (!privateKeyString.value) {
      return message.error('请填入私钥');
    }

    try {
      checking.value = true;
      currentSubAccountAmount.value = 0;
      const result: any = await checkSubAccount(privateKeyString.value);
      currentSubAccountAmount.value = result[0];

      subAccountsList.value = [];
      if (currentSubAccountAmount.value > 0) {
        const subAccountsResult: any = await getSubAccount(privateKeyString.value);
        subAccountsList.value = subAccountsResult[0];
        await nftsAmountOfAddress();
      }

      message.success('查询子账户结果更新成功');
    } catch (e: any) {
      message.error(e.message);
    } finally {
      checking.value = false;
    }
  };
</script>

<route lang="yaml">
meta:
  layout: default
</route>

