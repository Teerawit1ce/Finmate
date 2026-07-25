import { defineStore } from 'pinia'
import type { Transaction } from '@/models'

interface DailyLog {
  date: string
  total: number
  transactions: Transaction[]
}

interface AIResponse {
  message: string
  actions?: { label: string; handler: string }[]
  detected?: { type: string; details: string }
}

export const useHarnTaoStore = defineStore('HarnTaoStore', () => {
  // === Mock Transaction Data (Student life themed) ===
  const transactions = ref<Transaction[]>([])

  function generateMockData() {
    const now = new Date()
    const mock: Transaction[] = [
      { id:'tx1', type:'expense', category:'อาหารและเครื่องดื่ม', amount:60, description:'ข้าวผัดกระเพรา', transactionDate:'2026-07-25', userId:'demo', createdAt:'' },
      { id:'tx2', type:'expense', category:'อาหารและเครื่องดื่ม', amount:180, description:'กินหมูกระทะกับเพื่อน (หาร 4)', transactionDate:'2026-07-24', userId:'demo', createdAt:'' },
      { id:'tx3', type:'expense', category:'เดินทาง', amount:85, description:'ค่า BTS ไปมหาลัย', transactionDate:'2026-07-24', userId:'demo', createdAt:'' },
      { id:'tx4', type:'expense', category:'บันเทิง', amount:65, description:'ชานมไข่มุก', transactionDate:'2026-07-23', userId:'demo', createdAt:'' },
      { id:'tx5', type:'expense', category:'ช้อปปิ้ง', amount:250, description:'ซื้อเสื้อมือสอง', transactionDate:'2026-07-23', userId:'demo', createdAt:'' },
      { id:'tx6', type:'expense', category:'อาหารและเครื่องดื่ม', amount:120, description:'ก๋วยเตี๋ยวเรือ', transactionDate:'2026-07-22', userId:'demo', createdAt:'' },
      { id:'tx7', type:'income', category:'เงินเดือน', amount:11000, description:'ค่าขนมจากที่บ้าน', transactionDate:'2026-07-20', userId:'demo', createdAt:'' },
      { id:'tx8', type:'income', category:'ฟรีแลนซ์', amount:1500, description:'รับทำกราฟิก', transactionDate:'2026-07-19', userId:'demo', createdAt:'' },
      { id:'tx9', type:'expense', category:'สาธารณูปโภค', amount:399, description:'เติมเงินมือถือ', transactionDate:'2026-07-18', userId:'demo', createdAt:'' },
      { id:'tx10', type:'expense', category:'บันเทิง', amount:89, description:'ดูหนัง IMAX', transactionDate:'2026-07-17', userId:'demo', createdAt:'' },
      { id:'tx11', type:'expense', category:'อาหารและเครื่องดื่ม', amount:40, description:'ไอติม', transactionDate:'2026-07-16', userId:'demo', createdAt:'' },
      { id:'tx12', type:'expense', category:'การศึกษา', amount:350, description:'ซื้อหนังสือเตรียมสอบ', transactionDate:'2026-07-15', userId:'demo', createdAt:'' },
      { id:'tx13', type:'expense', category:'อาหารและเครื่องดื่ม', amount:220, description:'บุฟเฟ่ต์หมูกระทะ', transactionDate:'2026-07-14', userId:'demo', createdAt:'' },
      { id:'tx14', type:'income', category:'อื่นๆ', amount:500, description:'เพื่อนใช้เงินคืน', transactionDate:'2026-07-13', userId:'demo', createdAt:'' },
      { id:'tx15', type:'expense', category:'สุขภาพ', amount:120, description:'ยาทาแก้แพ้', transactionDate:'2026-07-12', userId:'demo', createdAt:'' },
      { id:'tx16', type:'expense', category:'ช้อปปิ้ง', amount:590, description:'ซื้อคีย์แคป', transactionDate:'2026-07-11', userId:'demo', createdAt:'' },
      { id:'tx17', type:'expense', category:'บันเทิง', amount:45, description:'ค่าตั๋วรอบดึก LINE MAN', transactionDate:'2026-07-10', userId:'demo', createdAt:'' },
    ]
    transactions.value = mock
  }

  // Call generate immediately
  generateMockData()

  // === Computed ===
  const totalIncome = computed(() =>
    transactions.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  )
  const totalExpense = computed(() =>
    transactions.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  )
  const balance = computed(() => totalIncome.value - totalExpense.value)

  const byCategory = computed(() => {
    const map: Record<string, { category: string; type: string; total: number }> = {}
    transactions.value.forEach(t => {
      const key = `${t.type}:${t.category}`
      if (!map[key]) map[key] = { category: t.category, type: t.type, total: 0 }
      map[key].total += t.amount
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  })

  const thisMonthExpenses = computed(() => {
    const now = new Date()
    const m = now.getMonth() + 1
    const y = now.getFullYear()
    return transactions.value.filter(t => {
      const d = new Date(t.transactionDate)
      return t.type === 'expense' && d.getMonth() + 1 === m && d.getFullYear() === y
    })
  })

  const todayExpenses = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return transactions.value.filter(t => t.type === 'expense' && t.transactionDate === today)
  })

  const topCategory = computed(() => {
    const sorted = [...byCategory.value].filter(b => b.type === 'expense').sort((a, b) => b.total - a.total)
    return sorted[0] || null
  })

  // === Chat AI Engine ===
  function processChat(input: string): AIResponse {
    const lower = input.toLowerCase().trim()

    // Detect "เงินจะหมด"
    if (lower.includes('เงินจะหมด') || lower.includes('ตังหมด') || lower.includes('เงินหมด')) {
      const subsTotal = 2014
      const dailyAvg = Math.round(thisMonthExpenses.value.reduce((s, t) => s + t.amount, 0) / Math.max(1, 25))
      return {
        message: `💰 สรุปสถานะการเงินของคุณวันนี้:\n\n` +
          `💸 รายจ่ายวันนี้: ${todayExpenses.value.reduce((s,t) => s + t.amount, 0)} บาท\n` +
          `📊 เฉลี่ยรายวัน: ${dailyAvg} บาท\n` +
          `🔴 ⚠️ พรุ่งนี้ (26 ก.ค.) จะมีการตัดค่า **Netflix 419 บาท**!\n` +
          `   ตรวจพบว่าคุณไม่ได้เปิด Netflix มา 2 เดือนแล้ว → อยากให้ยกเลิกไหม?\n\n` +
          `💡 รวม Subscription รายเดือน: ${subsTotal} บาท\n` +
          `   (Netflix 419 + Spotify 69 + ChatGPT 720 + YouTube 159 + iCloud 99 + Canva 259 + อื่นๆ 289)\n\n` +
          `💰 เงินคงเหลือ: ${balance.value} บาท\n` +
          `📅 อีก 25 วันถึงสิ้นเดือน — เฉลี่ยใช้ได้วันละ ${Math.round((budget.value.monthlyLimit - thisMonthExpenses.value.reduce((s,t) => s + t.amount, 0)) / 25)} บาท/วัน`,
        actions: [
          { label: '✅ ยกเลิก Netflix', handler: 'cancel_netflix' },
          { label: '📋 ดู Subscription ทั้งหมด', handler: 'view_subs' },
        ],
        detected: { type: 'subscription_alert', details: 'Netflix 419 บาท พรุ่งนี้จะตัด' }
      }
    }

    // Detect subscription cancel intent
    if (lower.includes('ยกเลิก') && lower.includes('netflix')) {
      return {
        message: '✅ ตกลง! ฉันจะช่วยคุณยกเลิก Netflix\n\n' +
          '📋 **ขั้นตอน:**\n' +
          '1. เปิด Netflix → ไปที่ Account\n' +
          '2. กด Cancel Membership\n' +
          '3. ยืนยันการยกเลิก\n\n' +
          '💡 หรือกดปุ่มด้านล่างให้ฉันพาไปทีละขั้นตอนได้เลย!',
        actions: [
          { label: '🔗 ไปหน้า Netflix', handler: 'open_netflix' },
          { label: '🗓️ เตือนทีหลัง', handler: 'remind_later' },
        ]
      }
    }

    // Detect "ใช้เงิน..."
    if (lower.includes('ใช้เงิน') || lower.includes('เปลือง')) {
      const cat = topCategory.value
      if (cat) {
        return {
          message: `📊 จากการวิเคราะห์ของคุณ:\n\n` +
            `🍜 **หมวดที่ใช้เงินเยอะที่สุด:** ${cat.category} — ${cat.total.toLocaleString()} บาท\n\n` +
            `💡 **คำแนะนำ:**\n` +
            `• ลดกินข้าวนอกบ้านสัปดาห์ละ 2 มื้อ → ประหยัด ~300 บาท/สัปดาห์\n` +
            `• ทำข้าวกล่องไปเรียน → ประหยัด ~50 บาท/วัน\n` +
            `• ใช้ส่วนลดนักศึกษาที่ร้านอาหาร\n\n` +
            `📈 ถ้าปรับได้ เงินเหลือเก็บเดือนละ ~1,200 บาท → ซื้อของที่อยากได้จริงๆได้!`,
          actions: [
            { label: '📋 ดูรายละเอียดค่าใช้จ่าย', handler: 'view_expenses' },
            { label: '📊 ตั้งเป้าออมเงิน', handler: 'set_goal' },
          ]
        }
      }
    }

    // Detect subscription mention
    if (lower.includes('sub') || lower.includes('subscription') || lower.includes('ซับ') || lower.includes('รายเดือน') || lower.includes('ตัดเงิน')) {
      return {
        message: `📋 **Subscription ของคุณ (${7} รายการ):**\n\n` +
          `🟢 **Active:**\n` +
          `• Netflix — 419 บ/ด (ถึง 26 ก.ค.) ⚠️ พรุ่งนี้!\n` +
          `• Spotify — 69 บ/ด (ถึง 15 ส.ค.)\n` +
          `• ChatGPT — 720 บ/ด (ถึง 10 ส.ค.)\n` +
          `• YouTube — 159 บ/ด (ถึง 5 ส.ค.)\n` +
          `• iCloud — 99 บ/ด (ถึง 20 ส.ค.)\n` +
          `• Canva Pro — 259 บ/ด (ถึง 18 ส.ค.)\n\n` +
          `🔴 **กำลังจะตัดเร็วๆนี้:**\n` +
          `• Netflix 419 บ — **26 ก.ค. (พรุ่งนี้!)**\n\n` +
          `💰 **รวมรายเดือน: ${2014} บาท** — คิดเป็น ${Math.round(2014/11000*100)}% ของรายรับคุณ\n\n` +
          `💡 อยากให้ตรวจสอบ Netflix กับ Disney+ ที่ดูไม่ได้ใช้แล้วนะ!`,
        actions: [
          { label: '👀 ดูทั้งหมด', handler: 'view_subs' },
          { label: '✂️ ยกเลิกที่ไม่ได้ใช้', handler: 'cancel_unused' },
        ]
      }
    }

    // Detect expense logging
    const expenseMatch = lower.match(/(กิน|ซื้อ|จ่าย|ใช้)\s*(\S+)\s*(\d+)/)
    if (expenseMatch) {
      const item = expenseMatch[2]
      const amount = parseInt(expenseMatch[3])
      return {
        message: `✅ บันทึกแล้ว: **${item}** ${amount} บาท\n\n` +
          `💰 เงินเหลือวันนี้: ${budget.value.dailyQuota - todayExpenses.value.reduce((s,t) => s + t.amount, 0)} บาท\n` +
          `📅 สิ้นเดือนเหลือ: ${balance.value - amount} บาท\n\n` +
          (amount > 200 ? '😅 โห! ใช้เยอะจัง ระวังนิดนึงนะ' : '👍 เยี่ยม! บันทึกเรียบร้อย'),
        detected: { type: 'expense_logged', details: `${item} ${amount} บาท` }
      }
    }

    // Detect "กินข้าว" pattern
    const foodMatch = lower.match(/(.+)\s*(\d+)\s*บาท/)
    if (foodMatch) {
      const item = foodMatch[1].trim()
      const amount = parseInt(foodMatch[2])
      return {
        message: `✅ บันทึกแล้ว: **${item}** ${amount} บาท\n\n` +
          `💰 เงินเหลือวันนี้: ${Math.max(0, budget.value.dailyQuota - todayExpenses.value.reduce((s,t) => s + t.amount, 0) - amount)} บาท`,
        detected: { type: 'expense_logged', details: `${item} ${amount} บาท` }
      }
    }

    // Greeting
    if (lower.includes('สวัสดี') || lower.includes('หวัดดี') || lower.includes('hello') || lower.includes('hi')) {
      return {
        message: `สวัสดี! 👋 ยินดีต้อนรับสู่ **หารเท่า.ai**\n\n` +
          `ฉันคือ AI ผู้ช่วยบริหารเงินของคุณ 🤖\n\n` +
          `**สิ่งที่ฉันช่วยได้:**\n` +
          `• 💰 บันทึกรายรับ/รายจ่าย — แค่พิมพ์บอก!\n` +
          `• 📋 ตรวจสอบ Subscription — ดูว่ามีอะไรที่ลืมยกเลิก\n` +
          `• ⚠️ เตือนก่อนตัดเงิน — ไม่ให้ตกใจตอนบัตรเด้ง\n` +
          `• 📊 วิเคราะห์พฤติกรรม — ใช้เงินเปลืองกับอะไร\n` +
          `• 💡 แนะนำการออม — มีเงินเก็บ!`,
        actions: [
          { label: '💰 เช็คยอดเงิน', handler: 'check_balance' },
          { label: '📋 ดู Subscription', handler: 'view_subs' },
          { label: '🍜 บันทึกรายจ่าย', handler: 'log_expense' },
        ]
      }
    }

    // Default: AI parses as expense
    const numMatch = lower.match(/(\d+)/)
    if (numMatch) {
      const amount = parseInt(numMatch[1])
      return {
        message: `✅ บันทึกแล้ว! ${amount} บาท\n\n` +
          `💰 สรุปล่าสุด: รายรับ ${totalIncome.value.toLocaleString()} / รายจ่าย ${totalExpense.value.toLocaleString()} / คงเหลือ ${balance.value.toLocaleString()} บาท\n\n` +
          `💡 พิมพ์ "เงินจะหมดแล้ว" เพื่อดูคำแนะนำ!\n` +
          `📋 พิมพ์ "sub" เพื่อดู Subscription`,
        detected: { type: 'expense_logged', details: `${amount} บาท` }
      }
    }

    return {
      message: `ไม่แน่ใจว่าต้องการให้ช่วยอะไร 🙏\n\n` +
        `**ลองพิมพ์:**\n` +
        `• "สวัสดี" — เริ่มต้น\n` +
        `• "กินข้าว 60" — บันทึกรายจ่าย\n` +
        `• "sub" — ดู Subscription\n` +
        `• "เงินจะหมดแล้ว" — ตรวจสอบสถานะ + คำแนะนำ\n` +
        `• "ใช้เงินเปลือง" — วิเคราะห์ค่าใช้จ่าย`,
      actions: [
        { label: '💬 พิมพ์ "สวัสดี"', handler: 'type_greeting' },
      ]
    }
  }

  // === Chat Messages ===
  const chatMessages = ref<{ role: string; content: string; metadata?: any }[]>([
    {
      role: 'assistant',
      content: '👋 สวัสดี! ฉันคือ AI ผู้ช่วยบริหารเงิน **หารเท่า.ai**\n\nพิมพ์ "สวัสดี" เพื่อเริ่มต้น หรือพิมพ์รายจ่ายของคุณเลย เช่น "กินข้าว 60"'
    }
  ])

  function addMessage(role: string, content: string, metadata?: any) {
    chatMessages.value.push({ role, content, metadata })
  }

  function sendMessage(input: string) {
    if (!input.trim()) return
    addMessage('user', input)
    const response = processChat(input)
    setTimeout(() => {
      addMessage('assistant', response.message, response.detected)
      pendingActions.value = response.actions || []
    }, 500)
  }

  const pendingActions = ref<{ label: string; handler: string }[]>([])

  function executeAction(handler: string) {
    if (handler === 'view_subs') navigateTo('/subscriptions')
    else if (handler === 'cancel_netflix') sendMessage('ยกเลิก Netflix ให้หน่อย')
    else if (handler === 'view_expenses') navigateTo('/transactions')
    else if (handler === 'check_balance') sendMessage('เงินจะหมดแล้ว')
    else if (handler === 'log_expense') sendMessage('กินข้าว 60')
    else if (handler === 'type_greeting') sendMessage('สวัสดี')
    else if (handler === 'remind_later') addMessage('assistant', 'โอเค เดี๋ยวเตือนให้นะ 😊 พิมพ์ "sub" เมื่อไหร่ก็ได้')
    else if (handler === 'cancel_unused') {
      addMessage('assistant', '📋 **Subscription ที่อาจไม่ได้ใช้:**\n\n1. **Disney+ Hotstar** 199 บ/ด — ไม่ได้ดูเลย\n2. **Wongnai Pro** 89 บ/ด — ปิดไว้\n\nกดปุ่มด้านล่างเพื่อยกเลิกทีละรายการได้เลย!',
        { type: 'cancellation_list' })
      pendingActions.value = [
        { label: '✂️ ยกเลิก Disney+', handler: 'cancel_disney' },
        { label: '✂️ ยกเลิก Wongnai', handler: 'cancel_wongnai' },
      ]
    }
    else if (handler === 'cancel_disney') {
      addMessage('assistant', '✅ ยกเลิก **Disney+ Hotstar** แล้ว! ประหยัดเดือนละ 199 บาท (2,388 บาท/ปี) 🎉\n\nดีใจด้วย! เงินจำนวนนี้คุณสามารถเอาไปทำอย่างอื่นได้!')
      // Actually set it inactive
    }
    else if (handler === 'cancel_wongnai') {
      addMessage('assistant', '✅ ยกเลิก **Wongnai Pro** แล้ว! ประหยัดเดือนละ 89 บาท (1,068 บาท/ปี) 🎉')
    }
    else if (handler === 'set_goal') {
      addMessage('assistant', '🎯 **ตั้งเป้าออมเงิน:**\n\nคุณต้องการออมเงินเท่าไหร่ต่อเดือน?\n\nพิมพ์ตอบมาเลย เช่น "ออมเดือนละ 1000"')
    }
    else if (handler === 'open_netflix') {
      addMessage('assistant', '🔗 ลิงก์: https://www.netflix.com/account\n\nไปที่ Account → Cancel Membership ได้เลย!')
    }
    else {
      addMessage('assistant', 'ไม่รู้จักคำสั่งนี้ ลองพิมพ์ "สวัสดี" ดูนะครับ 😊')
    }
    pendingActions.value = []
  }

  function navigateTo(path: string) {
    window.location.hash = `#${path}`
  }

  function addCustomTransaction(type: string, category: string, amount: number, description: string) {
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      type: type as 'income' | 'expense',
      category,
      amount,
      description,
      transactionDate: new Date().toISOString().split('T')[0],
      userId: 'demo',
      createdAt: new Date().toISOString()
    }
    transactions.value.unshift(tx)
  }

  return {
    transactions, totalIncome, totalExpense, balance, byCategory,
    thisMonthExpenses, todayExpenses, topCategory,
    chatMessages, pendingActions,
    sendMessage, executeAction, addMessage,
    processChat, generateMockData, addCustomTransaction,
  }
})
