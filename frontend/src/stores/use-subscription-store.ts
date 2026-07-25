import { defineStore } from 'pinia'
import type { Subscription } from '@/models/subscription'
import { MOCK_SUBSCRIPTIONS } from '@/models/subscription'

export const useSubscriptionStore = defineStore('SubStore', () => {
  const subscriptions = ref<Subscription[]>([...MOCK_SUBSCRIPTIONS])
  const isLoading = ref(false)

  function getDueSoon(days: number = 3): Subscription[] {
    const now = new Date()
    return subscriptions.value.filter(s => {
      if (!s.isActive) return false
      const next = new Date(s.nextBilling)
      const diff = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff <= days
    })
  }

  function getTotalMonthly(): number {
    return subscriptions.value
      .filter(s => s.isActive)
      .reduce((sum, s) => sum + s.amount, 0)
  }

  function toggleActive(id: string) {
    const idx = subscriptions.value.findIndex(s => s.id === id)
    if (idx !== -1) subscriptions.value[idx].isActive = !subscriptions.value[idx].isActive
  }

  function remove(id: string) {
    subscriptions.value = subscriptions.value.filter(s => s.id !== id)
  }

  function add(sub: Subscription) {
    subscriptions.value.unshift(sub)
  }

  return { subscriptions, isLoading, getDueSoon, getTotalMonthly, toggleActive, remove, add }
})
