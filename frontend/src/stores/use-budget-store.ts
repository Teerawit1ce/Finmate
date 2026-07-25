import { defineStore } from 'pinia'

export const useBudgetStore = defineStore('BudgetStore', () => {
  const now = new Date()
  const budget = ref({
    id: 'budget1',
    monthlyLimit: 12000,
    dailyQuota: 400,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  })

  function updateMonthly(amount: number) {
    budget.value.monthlyLimit = amount
  }

  function updateDaily(amount: number) {
    budget.value.dailyQuota = amount
  }

  return { budget, updateMonthly, updateDaily }
})
