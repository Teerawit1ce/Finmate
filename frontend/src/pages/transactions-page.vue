<script setup lang="ts">
import { useHarnTaoStore } from '@/stores/use-harntao-store'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/models'

const harnTao = useHarnTaoStore()
const { transactions, totalIncome, totalExpense, balance } = storeToRefs(harnTao)

const typeFilter = ref<'all' | 'income' | 'expense'>('all')
const categoryFilter = ref('all')

const filteredTx = computed(() => {
  let list = transactions.value
  if (typeFilter.value !== 'all') list = list.filter(t => t.type === typeFilter.value)
  if (categoryFilter.value !== 'all') list = list.filter(t => t.category === categoryFilter.value)
  return list
})

const categories = computed(() => {
  const cats = new Set<string>()
  transactions.value.forEach(t => cats.add(t.category))
  return Array.from(cats).sort()
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="pa-4">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <div class="text-h5 font-weight-bold">💳 รายการทั้งหมด</div>
        <div class="text-body-2 text-medium-emphasis">ประวัติรายรับ-รายจ่าย</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="d-flex flex-wrap align-center gap-2 mb-4">
      <VBtnToggle v-model="typeFilter" density="compact" color="primary" mandatory>
        <VBtn value="all" size="small">ทั้งหมด</VBtn>
        <VBtn value="income" size="small">💰 รายรับ</VBtn>
        <VBtn value="expense" size="small">💸 รายจ่าย</VBtn>
      </VBtnToggle>
      <VSelect v-model="categoryFilter" :items="['all', ...categories]" density="compact" hide-details
        style="min-width:160px" label="หมวดหมู่" variant="outlined" />
    </div>

    <!-- Transaction List -->
    <div v-for="tx in filteredTx" :key="tx.id" class="mb-2">
      <VCard elevation="0" class="border">
        <VCardText class="pa-3">
          <div class="d-flex align-center">
            <VAvatar :color="tx.type === 'income' ? 'success' : 'error'" size="36" class="me-3" variant="tonal">
              <VIcon>{{ tx.type === 'income' ? 'ri-money-dollar-circle-line' : 'ri-shopping-cart-line' }}</VIcon>
            </VAvatar>
            <div class="flex-grow-1">
              <div class="text-body-2 font-weight-medium">{{ tx.description || tx.category }}</div>
              <div class="text-caption text-medium-emphasis">{{ tx.category }} · {{ formatDate(tx.transactionDate) }}</div>
            </div>
            <div class="text-right">
              <div class="text-body-1 font-weight-bold" :class="tx.type === 'income' ? 'text-success' : 'text-error'">
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </div>

    <div v-if="!filteredTx.length" class="text-center py-8 text-disabled">ไม่พบรายการ</div>
  </div>
</template>
