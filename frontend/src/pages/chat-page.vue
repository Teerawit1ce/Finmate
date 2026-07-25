<script setup lang="ts">
import { useHarnTaoStore } from '@/stores/use-harntao-store'
import { useSubscriptionStore } from '@/stores/use-subscription-store'

const harnTao = useHarnTaoStore()
const subStore = useSubscriptionStore()
const { chatMessages, pendingActions } = storeToRefs(harnTao)

const input = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const loading = ref(false)

async function send() {
  if (!input.value.trim()) return
  const msg = input.value
  input.value = ''
  loading.value = true
  harnTao.sendMessage(msg)
  await nextTick()
  scrollToBottom()
  loading.value = false
}

function handleAction(handler: string) {
  harnTao.executeAction(handler)
  nextTick(() => scrollToBottom())
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

function formatMsg(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function quickExpense() {
  input.value = 'กินข้าว 60'
  send()
}

function quickSubs() {
  input.value = 'sub'
  send()
}

function quickMoney() {
  input.value = 'เงินจะหมดแล้ว'
  send()
}

const today = new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

// Also update the navigation
const dueSoon = computed(() => subStore.getDueSoon(3))
</script>

<template>
  <div class="chat-page" style="height: calc(100vh - 160px); display: flex; flex-direction: column;">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between pa-4" style="border-bottom:1px solid var(--border-color,rgba(0,0,0,.08))">
      <div>
        <div class="text-h6 font-weight-bold">🤖 หารเท่า.ai</div>
        <div class="text-caption text-medium-emphasis">{{ today }}</div>
      </div>
      <div class="d-flex align-center gap-2">
        <VChip v-if="dueSoon.length" color="error" size="small" class="font-weight-bold">
          🔔 {{ dueSoon.length }} รายการใกล้ถึงกำหนด
        </VChip>
      </div>
    </div>

    <!-- Chat Messages -->
    <div ref="chatContainer" class="flex-grow-1 overflow-y-auto pa-4" style="background:#f8fafc;">
      <div v-for="(msg, i) in chatMessages" :key="i" class="mb-4">
        <!-- User message -->
        <div v-if="msg.role === 'user'" class="d-flex justify-end mb-2">
          <div class="pa-3 rounded-lg" style="max-width:80%;background:linear-gradient(135deg,#4F46E5,#6366F1);color:#fff;border-radius:16px 16px 4px 16px">
            <div class="text-body-2" v-html="formatMsg(msg.content)"></div>
          </div>
        </div>

        <!-- System/Info message -->
        <div v-else-if="msg.role === 'system'" class="d-flex justify-center mb-2">
          <VChip size="small" color="warning" variant="tonal">
            {{ msg.content }}
          </VChip>
        </div>

        <!-- Assistant message -->
        <div v-else class="d-flex mb-2">
          <div class="d-flex gap-2" style="max-width:85%">
            <VAvatar size="36" color="green" class="flex-shrink-0">
              <span class="text-white">🤖</span>
            </VAvatar>
            <div>
              <div class="pa-3 rounded-lg" style="background:#fff;border:1px solid #e5e7eb;border-radius:16px 16px 16px 4px;box-shadow:0 1px 3px rgba(0,0,0,.04)">
                <div class="text-body-2" style="line-height:1.6;white-space:pre-wrap" v-html="formatMsg(msg.content)"></div>

                <!-- Action Buttons -->
                <div v-if="i === chatMessages.length - 1 && pendingActions.length" class="mt-3 d-flex flex-wrap gap-2">
                  <VBtn v-for="action in pendingActions" :key="action.handler" size="small" variant="tonal" color="primary" @click="handleAction(action.handler)">
                    {{ action.label }}
                  </VBtn>
                </div>
              </div>
              <div class="text-caption text-disabled mt-1 ml-1">HarnTao AI</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="d-flex mb-2">
        <div class="pa-3 rounded-lg" style="background:#fff;border:1px solid #e5e7eb;border-radius:16px">
          <div class="d-flex gap-1">
            <span class="dot-pulse"></span>
            <span class="dot-pulse"></span>
            <span class="dot-pulse"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="pa-2 d-flex gap-2 overflow-x-auto" style="border-top:1px solid var(--border-color,rgba(0,0,0,.08));background:#fff">
      <VChip label size="small" color="primary" variant="tonal" @click="quickExpense" class="flex-shrink-0">
        🍜 บันทึกรายจ่าย
      </VChip>
      <VChip label size="small" color="warning" variant="tonal" @click="quickMoney" class="flex-shrink-0">
        💰 เช็คเงินคงเหลือ
      </VChip>
      <VChip label size="small" color="info" variant="tonal" @click="quickSubs" class="flex-shrink-0">
        📋 Subscription
      </VChip>
    </div>

    <!-- Input -->
    <div class="pa-3" style="border-top:1px solid var(--border-color,rgba(0,0,0,.08));background:#fff">
      <VTextField
        v-model="input"
        placeholder="พิมพ์รายจ่ายของคุณ... เช่น 'กินข้าว 60' หรือ 'sub'"
        variant="solo"
        hide-details
        density="comfortable"
        rounded
        @keydown.enter="send"
        :disabled="loading"
        class="chat-input"
      >
        <template #append-inner>
          <VBtn icon size="small" color="primary" @click="send" :loading="loading" :disabled="!input.trim()">
            <VIcon icon="ri-send-plane-fill" size="20" />
          </VBtn>
        </template>
      </VTextField>
    </div>
  </div>
</template>

<style scoped>
.chat-input :deep(.v-field) {
  border-radius: 24px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,.06) !important;
}
.dot-pulse {
  width: 8px; height: 8px; border-radius: 50%;
  background: #6366F1;
  animation: pulse 1.4s ease-in-out infinite;
}
.dot-pulse:nth-child(2) { animation-delay: .2s; }
.dot-pulse:nth-child(3) { animation-delay: .4s; }
@keyframes pulse {
  0%, 80%, 100% { opacity: .3; transform: scale(.8); }
  40% { opacity: 1; transform: scale(1.2); }
}
</style>
