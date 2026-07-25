<script setup lang="ts">
import { useHarnTaoStore } from '@/stores/use-harntao-store'
import { useSubscriptionStore } from '@/stores/use-subscription-store'
import { useBudgetStore } from '@/stores/use-budget-store'

const harnTao = useHarnTaoStore()
const subStore = useSubscriptionStore()
const bStore = useBudgetStore()

const { totalIncome, totalExpense, balance, byCategory } = storeToRefs(harnTao)
const { budget } = storeToRefs(bStore)

const monthlySubs = computed(() => subStore.getTotalMonthly())
const expenseRatio = computed(() => {
  if (totalIncome.value === 0) return 0
  return Math.round((totalExpense.value / totalIncome.value) * 100)
})
const dailyLeft = computed(() => {
  const daysLeft = 31 - new Date().getDate()
  if (daysLeft <= 0) return 0
  return Math.round((budget.value.monthlyLimit - harnTao.thisMonthExpenses.reduce((s,t) => s + t.amount, 0)) / daysLeft)
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}
</script>

<template>
  <div class="pa-4">
    <div class="text-h5 font-weight-bold mb-1">📊 สรุปการเงิน</div>
    <div class="text-body-2 text-medium-emphasis mb-4">ภาพรวมรายรับ-รายจ่ายเดือนนี้</div>

    <!-- Summary Cards -->
    <VRow>
      <VCol cols="12" sm="4">
        <VCard class="pa-4" color="success" variant="tonal" elevation="0">
          <VCardText class="pa-0">
            <div class="text-caption text-medium-emphasis mb-1">💰 รายรับ</div>
            <div class="text-h4 font-weight-bold text-success">{{ formatCurrency(totalIncome) }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard class="pa-4" color="error" variant="tonal" elevation="0">
          <VCardText class="pa-0">
            <div class="text-caption text-medium-emphasis mb-1">💸 รายจ่าย</div>
            <div class="text-h4 font-weight-bold text-error">{{ formatCurrency(totalExpense) }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard class="pa-4" :color="balance >= 0 ? 'info' : 'warning'" variant="tonal" elevation="0">
          <VCardText class="pa-0">
            <div class="text-caption text-medium-emphasis mb-1">💼 คงเหลือ</div>
            <div class="text-h4 font-weight-bold" :class="balance >= 0 ? 'text-info' : 'text-warning'">
              {{ formatCurrency(balance) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Budget Health -->
    <VCard class="mt-4 pa-4" elevation="0">
      <div class="text-subtitle-1 font-weight-bold mb-2">📈 สัดส่วนค่าใช้จ่าย</div>
      <VRow align="center">
        <VCol cols="12" sm="6">
          <VProgressLinear :model-value="expenseRatio" height="20" rounded
            :color="expenseRatio > 90 ? 'error' : expenseRatio > 70 ? 'warning' : 'success'"
            class="mb-2" />
          <div class="d-flex justify-space-between text-caption">
            <span>ใช้ไป {{ formatCurrency(totalExpense) }}</span>
            <span>{{ expenseRatio }}% ของรายรับ</span>
          </div>
          <div class="mt-3 d-flex gap-4 flex-wrap">
            <div>
              <div class="text-caption text-medium-emphasis">💰 Subscription/เดือน</div>
              <div class="text-body-1 font-weight-bold">{{ formatCurrency(monthlySubs) }}</div>
            </div>
            <div>
              <div class="text-caption text-medium-emphasis">📅 ใช้ได้วันละ</div>
              <div class="text-body-1 font-weight-bold">{{ formatCurrency(dailyLeft) }}</div>
            </div>
            <div>
              <div class="text-caption text-medium-emphasis">🎯 งบประมาณรายเดือน</div>
              <div class="text-body-1 font-weight-bold">{{ formatCurrency(budget.monthlyLimit) }}</div>
            </div>
          </div>
        </VCol>
        <VCol cols="12" sm="6">
          <div class="text-subtitle-2 font-weight-bold mb-2">ค่าใช้จ่ายแยกตามหมวด</div>
          <div v-for="cat in byCategory.filter(c => c.type === 'expense').slice(0, 6)" :key="cat.category" class="d-flex align-center mb-2">
            <span class="text-body-2 flex-grow-1">{{ cat.category }}</span>
            <div class="flex-grow-1 mx-2">
              <VProgressLinear :model-value="(cat.total / totalExpense) * 100" height="6" rounded color="primary" />
            </div>
            <span class="text-body-2 font-weight-bold" style="min-width:80px;text-align:right">{{ formatCurrency(cat.total) }}</span>
          </div>
        </VCol>
      </VRow>
    </VCard>

    <!-- Alerts Section -->
    <VCard class="mt-4 pa-4" elevation="0">
      <div class="text-subtitle-1 font-weight-bold mb-2">⚠️ การแจ้งเตือน</div>
      <VList>
        <VListItem v-for="sub in subStore.getDueSoon(3)" :key="sub.id">
          <template #prepend>
            <VIcon :color="'error'" class="me-2">ri-alarm-warning-line</VIcon>
          </template>
          <VListItemTitle class="font-weight-medium">
            🔔 {{ sub.name }} — {{ formatCurrency(sub.amount) }}
            <VChip size="x-small" color="error" class="ml-2">
              {{ new Date(sub.nextBilling).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) }}
            </VChip>
          </VListItemTitle>
          <VListItemSubtitle>กำลังจะตัดเงินเร็วๆนี้</VListItemSubtitle>
        </VListItem>
        <VListItem v-if="!subStore.getDueSoon(3).length">
          <VListItemTitle class="text-medium-emphasis">✅ ไม่มีการแจ้งเตือน — Subscription ทั้งหมดปกติ</VListItemTitle>
        </VListItem>
      </VList>
    </VCard>
  </div>
</template>
