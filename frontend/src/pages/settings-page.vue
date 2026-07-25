<script setup lang="ts">
import { useBudgetStore } from '@/stores/use-budget-store'

const bStore = useBudgetStore()
const { budget } = storeToRefs(bStore)

const monthlyInput = ref(budget.value.monthlyLimit)
const dailyInput = ref(budget.value.dailyQuota)
const saved = ref(false)

function save() {
  bStore.updateMonthly(monthlyInput.value)
  bStore.updateDaily(dailyInput.value)
  saved.value = true
  setTimeout(() => saved.value = false, 2000)
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}
</script>

<template>
  <div class="pa-4">
    <div class="text-h5 font-weight-bold mb-1">⚙️ ตั้งค่า</div>
    <div class="text-body-2 text-medium-emphasis mb-4">กำหนดวงเงินและงบประมาณรายเดือน</div>

    <VCard class="pa-4 mb-4" elevation="0">
      <div class="text-subtitle-1 font-weight-bold mb-3">💰 งบประมาณรายเดือน</div>

      <VTextField v-model.number="monthlyInput" label="วงเงินรายเดือน (บาท)" type="number" min="0"
        prepend-inner-icon="ri-money-dollar-circle-line" class="mb-4" variant="outlined" />

      <VTextField v-model.number="dailyInput" label="โควต้ารายวัน (บาท)" type="number" min="0"
        prepend-inner-icon="ri-calendar-line" class="mb-4" variant="outlined" />

      <div class="d-flex align-center gap-4 mb-4 flex-wrap">
        <VChip variant="tonal" color="info">
          📊 {{ formatCurrency(budget.monthlyLimit) }} / เดือน
        </VChip>
        <VChip variant="tonal" color="primary">
          📅 {{ formatCurrency(budget.dailyQuota) }} / วัน
        </VChip>
      </div>

      <VBtn color="primary" @click="save" :disabled="saved">
        {{ saved ? '✅ บันทึกแล้ว!' : '💾 บันทึก' }}
      </VBtn>
    </VCard>

    <!-- Tips -->
    <VCard class="pa-4" elevation="0" color="info" variant="tonal">
      <div class="text-subtitle-2 font-weight-bold mb-2">💡 เทคนิคบริหารเงินสำหรับนักศึกษา</div>
      <VList density="compact">
        <VListItem>
          <template #prepend><VIcon color="success" class="me-2">ri-check-line</VIcon></template>
          <VListItemTitle>กฎ 50/30/20: 50% ของใช้, 30% อยากได้, 20% ออม</VListItemTitle>
        </VListItem>
        <VListItem>
          <template #prepend><VIcon color="success" class="me-2">ri-check-line</VIcon></template>
          <VListItemTitle>ตรวจสอบ Subscription ทุกเดือน — ยกเลิกอันที่ไม่ได้ใช้</VListItemTitle>
        </VListItem>
        <VListItem>
          <template #prepend><VIcon color="success" class="me-2">ri-check-line</VIcon></template>
          <VListItemTitle>ใช้ส่วนลดนักศึกษาให้คุ้ม (Spotify Student 69฿, YouTube Premium 59฿)</VListItemTitle>
        </VListItem>
      </VList>
    </VCard>
  </div>
</template>
