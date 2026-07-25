<script setup lang="ts">
import { useSubscriptionStore } from '@/stores/use-subscription-store'
import type { Subscription } from '@/models/subscription'

const subStore = useSubscriptionStore()
const { subscriptions } = storeToRefs(subStore)

const filterActive = ref<'all' | 'active' | 'inactive'>('active')
const deleteDialog = ref(false)
const deletingSub = ref<Subscription | null>(null)
const snackbar = ref(false)
const snackText = ref('')

const filteredSubs = computed(() => {
  if (filterActive.value === 'all') return subscriptions.value
  return subscriptions.value.filter(s => filterActive.value === 'active' ? s.isActive : !s.isActive)
})

const totalActive = computed(() => subscriptions.value.filter(s => s.isActive).reduce((sum, s) => sum + s.amount, 0))

function toggleSub(sub: Subscription) {
  subStore.toggleActive(sub.id)
  snackText.value = sub.isActive ? '✅ ยกเลิก Subscription แล้ว' : '✅ เปิดใช้งานอีกครั้ง'
  snackbar.value = true
}

function confirmDelete(sub: Subscription) {
  deletingSub.value = sub
  deleteDialog.value = true
}

function doDelete() {
  if (!deletingSub.value) return
  subStore.remove(deletingSub.value.id)
  deleteDialog.value = false
  snackText.value = '🗑️ ลบ Subscription แล้ว'
  snackbar.value = true
}

function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

const isUrgent = (sub: Subscription) => sub.isActive && daysUntil(sub.nextBilling) <= 3
</script>

<template>
  <div class="pa-4">
    <div class="text-h5 font-weight-bold mb-1">📋 Subscription</div>
    <div class="text-body-2 text-medium-emphasis mb-4">จัดการ Subscription ทั้งหมดของคุณ</div>

    <!-- Summary Banner -->
    <VCard class="pa-4 mb-4" color="primary" variant="tonal" elevation="0">
      <VRow align="center">
        <VCol cols="6" sm="3">
          <div class="text-caption">Active</div>
          <div class="text-h5 font-weight-bold">{{ subscriptions.filter(s => s.isActive).length }} รายการ</div>
        </VCol>
        <VCol cols="6" sm="3">
          <div class="text-caption">รวม/เดือน</div>
          <div class="text-h5 font-weight-bold">{{ formatCurrency(totalActive) }}</div>
        </VCol>
        <VCol cols="6" sm="3">
          <div class="text-caption">รวม/ปี</div>
          <div class="text-h5 font-weight-bold">{{ formatCurrency(totalActive * 12) }}</div>
        </VCol>
        <VCol cols="6" sm="3">
          <div class="text-caption">% ของรายรับ</div>
          <div class="text-h5 font-weight-bold">{{ Math.round(totalActive / 11000 * 100) }}%</div>
        </VCol>
      </VRow>
    </VCard>

    <!-- Filter Tabs -->
    <div class="d-flex align-center mb-4">
      <VBtnToggle v-model="filterActive" density="compact" color="primary" mandatory>
        <VBtn value="active" size="small">🟢 Active</VBtn>
        <VBtn value="inactive" size="small">🔴 ยกเลิกแล้ว</VBtn>
        <VBtn value="all" size="small">ทั้งหมด</VBtn>
      </VBtnToggle>
    </div>

    <!-- Subscription List -->
    <div v-for="sub in filteredSubs" :key="sub.id" class="mb-3">
      <VCard :class="{ 'border-warning': isUrgent(sub) }" :elevation="0" class="border">
        <VCardText class="pa-4">
          <VRow align="center">
            <VCol cols="12" sm="6" class="d-flex align-center gap-3">
              <VAvatar :color="sub.isActive ? 'success' : 'grey'" size="40">
                <span class="text-h6">{{ sub.serviceName[0] }}</span>
              </VAvatar>
              <div>
                <div class="text-body-1 font-weight-medium">
                  {{ sub.name }}
                  <VChip v-if="isUrgent(sub)" size="x-small" color="error" class="ml-1">
                    🔔 {{ daysUntil(sub.nextBilling) }} วัน
                  </VChip>
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ sub.category }} — ตัดทุกวันที่ {{ sub.billingDate }}
                </div>
              </div>
            </VCol>
            <VCol cols="6" sm="2">
              <div class="text-body-1 font-weight-bold">{{ formatCurrency(sub.amount) }}</div>
              <div class="text-caption text-medium-emphasis">/{{ sub.billingCycle === 'monthly' ? 'เดือน' : sub.billingCycle === 'yearly' ? 'ปี' : 'สัปดาห์' }}</div>
            </VCol>
            <VCol cols="6" sm="2">
              <div v-if="sub.isActive" class="text-body-2">
                <span :class="daysUntil(sub.nextBilling) <= 3 ? 'text-error font-weight-bold' : ''">
                  ถึง {{ new Date(sub.nextBilling).toLocaleDateString('th-TH', { day:'numeric', month:'short' }) }}
                </span>
              </div>
              <div v-else class="text-body-2 text-disabled">ยกเลิกแล้ว</div>
            </VCol>
            <VCol cols="12" sm="2" class="d-flex justify-end gap-1">
              <IconBtn @click="toggleSub(sub)" :color="sub.isActive ? 'error' : 'success'" size="small">
                <VIcon :icon="sub.isActive ? 'ri-pause-circle-line' : 'ri-play-circle-line'" />
              </IconBtn>
              <IconBtn @click="confirmDelete(sub)" color="error" size="small">
                <VIcon icon="ri-delete-bin-line" />
              </IconBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </div>

    <div v-if="!filteredSubs.length" class="text-center py-8 text-disabled">ไม่มี Subscription ในหมวดนี้</div>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="ลบ Subscription">
        <VCardText>แน่ใจว่าจะลบ <strong>{{ deletingSub?.name }}</strong> ถาวร?</VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">ยกเลิก</VBtn>
          <VBtn color="error" @click="doDelete">ลบ</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VSnackbar v-model="snackbar" :timeout="2000">{{ snackText }}</VSnackbar>
  </div>
</template>
