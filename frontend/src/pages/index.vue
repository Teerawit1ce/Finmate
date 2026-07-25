<script setup lang="ts">
import { useSubscriptionStore } from '@/stores/use-subscription-store'

const subStore = useSubscriptionStore()
const dueSoon = computed(() => subStore.getDueSoon(3))

function goTo(path: string) {
  window.location.hash = `#${path}`
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}
</script>

<template>
  <div class="pa-4">
    <!-- Hero -->
    <div class="text-center mb-6 mt-4">
      <div class="text-h3 font-weight-bold mb-2" style="background:linear-gradient(135deg,#4F46E5,#10b981);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
        �ารเท่า.ai
      </div>
      <div class="text-h6 text-medium-emphasis">AI ที่ทวงค่าหมูกระทะแทนคุณ</div>
      <div class="text-body-2 text-disabled mt-1">เพื่อนยังเป็นเพื่อน เงินก็ได้คืน</div>
    </div>

    <!-- Quick Access Cards -->
    <VRow>
      <VCol cols="6">
        <VCard class="pa-3 text-center" color="primary" variant="tonal" @click="goTo('/chat')" hover>
          <VIcon size="36" color="primary" class="mb-2">ri-chat-3-line</VIcon>
          <div class="text-body-2 font-weight-medium">🤖 แชทกับ AI</div>
          <div class="text-caption text-disabled">พิมพ์รายจ่าย แค่บอก</div>
        </VCard>
      </VCol>
      <VCol cols="6">
        <VCard class="pa-3 text-center" color="info" variant="tonal" @click="goTo('/dashboard')" hover>
          <VIcon size="36" color="info" class="mb-2">ri-dashboard-line</VIcon>
          <div class="text-body-2 font-weight-medium">📊 ดัชบอร์ด</div>
          <div class="text-caption text-disabled">สรุปยอด + กราฟ</div>
        </VCard>
      </VCol>
      <VCol cols="6">
        <VCard class="pa-3 text-center" color="warning" variant="tonal" @click="goTo('/subscriptions')" hover>
          <VIcon size="36" color="warning" class="mb-2">ri-bill-line</VIcon>
          <div class="text-body-2 font-weight-medium">📋 Subscription</div>
          <div class="text-caption text-disabled">จัดการ + แจ้งเตือน</div>
        </VCard>
      </VCol>
      <VCol cols="6">
        <VCard class="pa-3 text-center" color="success" variant="tonal" @click="goTo('/transactions')" hover>
          <VIcon size="36" color="success" class="mb-2">ri-list-check</VIcon>
          <div class="text-body-2 font-weight-medium">💳 รายการ</div>
          <div class="text-caption text-disabled">ประวัติใช้จ่าย</div>
        </VCard>
      </VCol>
    </VRow>

    <!-- Alert Banner -->
    <VCard v-if="dueSoon.length" class="mt-4 pa-3" color="error" variant="tonal">
      <VRow align="center">
        <VIcon color="error" class="me-2">ri-alarm-warning-fill</VIcon>
        <span class="text-body-2 font-weight-medium">⚠️ {{ dueSoon.length }} Subscription กำลังจะตัดเงิน!</span>
        <VSpacer />
        <VBtn size="small" color="error" variant="text" @click="goTo('/subscriptions')">ดู</VBtn>
      </VRow>
    </VCard>

    <!-- Stats -->
    <div class="mt-4 text-center">
      <div class="text-caption text-disabled">💡 พิมพ์ "สวัสดี" ในแชทเพื่อเริ่มใช้ AI หรือพิมพ์รายจ่ายเลย เช่น "กินข้าว 60"</div>
    </div>
  </div>
</template>
