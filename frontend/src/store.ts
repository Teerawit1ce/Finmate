import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Sub {
  id: string; name: string; service: string; icon: string
  amount: number; billingDay: number; nextBilling: string; active: boolean; note?: string
}

export interface Tx {
  id: string; type: 'income' | 'expense'; category: string
  amount: number; description: string; date: string
}

export interface Msg {
  id: string; role: 'user' | 'assistant'; text: string
  actions?: { label: string; handler: string }[]
  timestamp: number
}

interface Store {
  balance: number; subscriptions: Sub[]; transactions: Tx[]; messages: Msg[]; tab: string
  setTab: (t: string) => void
  logExpense: (amt: number, desc: string, cat?: string) => void
  toggleSub: (id: string) => void
  cancelSub: (id: string) => void
  addMsg: (m: Msg) => void
  processChat: (text: string) => { text: string; actions?: { label: string; handler: string }[] }
}

const TODAY = new Date().toISOString().slice(0, 10)
const DAYS = (s: string) => Math.ceil((new Date(s).getTime() - Date.now()) / 86400000)
const $ = (n: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(n)

export const useStore = create<Store>((set, get) => ({
  balance: 4500,
  tab: 'dashboard',
  setTab: (t) => set({ tab: t }),

  subscriptions: [
    { id:'s1', name:'Netflix Premium', service:'Netflix', icon:'N', amount:419, billingDay:26, nextBilling:'2026-07-26', active:true, note:'ไม่ได้เปิดดูมา 2 เดือน' },
    { id:'s2', name:'Spotify Premium', service:'Spotify', icon:'S', amount:139, billingDay:10, nextBilling:'2026-08-10', active:true },
    { id:'s3', name:'ChatGPT Plus', service:'OpenAI', icon:'C', amount:750, billingDay:20, nextBilling:'2026-08-20', active:true },
    { id:'s4', name:'iCloud+ 200GB', service:'Apple', icon:'A', amount:99, billingDay:15, nextBilling:'2026-08-15', active:true },
    { id:'s5', name:'YouTube Premium', service:'YouTube', icon:'Y', amount:159, billingDay:5, nextBilling:'2026-08-05', active:true },
  ],

  transactions: [
    { id:'a', type:'income', category:'เงินเดือน', amount:11000, description:'ค่าขนม', date:'2026-07-20' },
    { id:'b', type:'expense', category:'อาหาร', amount:180, description:'หมูกระทะ', date:'2026-07-24' },
    { id:'c', type:'expense', category:'เดินทาง', amount:85, description:'BTS', date:'2026-07-24' },
    { id:'d', type:'expense', category:'อาหาร', amount:60, description:'ข้าวผัด', date:'2026-07-25' },
    { id:'e', type:'expense', category:'ช้อปปิ้ง', amount:250, description:'เสื้อมือสอง', date:'2026-07-23' },
  ],

  messages: [
    { id:'m0', role:'assistant', text:'👋 สวัสดี! ฉันคือ **Finmate** ผู้ช่วยบริหารเงิน\n\nพิมพ์ "สวัสดี" เพื่อเริ่ม หรือพิมพ์ "กินข้าว 60"', timestamp:Date.now()-60000 },
    { id:'m1', role:'user', text:'เงินจะหมดแล้ว 😭', timestamp:Date.now()-30000 },
    { id:'m2', role:'assistant', text:'ใจเย็นๆ! 😊\n\nพรุ่งนี้ **Netflix 419 บาท**กำลังจะตัด แต่คุณไม่ได้ดูมา 2 เดือนแล้ว ยกเลิกเลยไหม?\n\nถ้ากดยกเลิกจะได้เงินคืน **419 บาท** ทันที! 🎉', actions:[{ label:'❌ ยกเลิก Netflix', handler:'cancel-netflix' }], timestamp:Date.now()-20000 },
  ],

  logExpense: (amt, desc, cat='อื่นๆ') => set((s) => ({
    balance: s.balance - amt,
    transactions: [{ id:'tx_'+Date.now(), type:'expense', category:cat||'อื่นๆ', amount:amt, description:desc, date:TODAY }, ...s.transactions],
  })),

  toggleSub: (id) => set((s) => ({
    subscriptions: s.subscriptions.map((x) => x.id === id ? { ...x, active: !x.active } : x),
  })),

  cancelSub: (id) => {
    const sub = get().subscriptions.find((x) => x.id === id)
    if (!sub?.active) return
    set((s) => ({ balance: s.balance + sub.amount, subscriptions: s.subscriptions.map((x) => x.id === id ? { ...x, active: false } : x) }))
    get().addMsg({ id:'msg_'+Date.now(), role:'assistant', text:`✅ **ยกเลิก ${sub.name} เรียบร้อย!** 🎉\n\nได้เงินคืน **${$(sub.amount)}** บาท!\n💰 **ยอดคงเหลือ: ${$(get().balance)}**\n\nเหลือไปกินหมูกระทะเพิ่มอีก ${$(sub.amount)}! 🔥`, timestamp:Date.now() })
  },

  addMsg: (m) => set((s) => ({ messages: [...s.messages, m] })),

  processChat: (text: string) => {
    const s = get()
    const l = text.toLowerCase().trim()

    if ((l.includes('ยกเลิก') && (l.includes('netflix') || l.includes('เน็ต')))) {
      s.cancelSub('s1')
      return { text: '', actions: [] }
    }

    const m = l.match(/(.+?)\s*(\d+)\s*บาท?$/)
    if (m) {
      s.logExpense(parseInt(m[2]), m[1].trim())
      return { text: `✅ บันทึก **${m[1].trim()}** ${$(parseInt(m[2]))} เรียบร้อย!\n💰 **ยอดคงเหลือ: ${$(s.balance)}**`, actions: [{ label:'💰 เช็คการเงิน', handler:'check' }] }
    }

    if (l.includes('เงินจะหมด') || l.includes('เงินหมด')) {
      const nl = s.subscriptions.find((x) => x.id === 's1')
      let r = `💰 **สรุปการเงิน:**\n\n💸 **ยอดคงเหลือ:** ${$(s.balance)}\n📋 **Subscriptions:** ${s.subscriptions.filter(x=>x.active).length} รายการ = ${$(s.subscriptions.filter(x=>x.active).reduce((a,x)=>a+x.amount,0))}/เดือน\n`
      if (nl?.active && DAYS(nl.nextBilling) <= 2) r += `\n🔴 **⚠️ พรุ่งนี้ ${nl.name} ${$(nl.amount)} จะตัด!** ยกเลิกไหม?\n`
      r += `\n💡 พิมพ์ "sub" ดู Subscription หรือ "กินข้าว 60" บันทึกรายจ่าย`
      const act: { label: string; handler: string }[] = []
      if (nl?.active) act.push({ label:'❌ ยกเลิก Netflix', handler:'cancel-netflix' })
      act.push({ label:'📋 ดูทั้งหมด', handler:'subs' })
      return { text: r, actions: act }
    }

    if (l.includes('sub') || l.includes('ซับ')) {
      const a = s.subscriptions.filter(x=>x.active), t = a.reduce((sum,x)=>sum+x.amount,0)
      return { text:`📋 **Subscription:**\n${a.map(x=>`• **${x.name}** ${$(x.amount)}/ด${DAYS(x.nextBilling)<=3?' ⚠️':''}`).join('\n')}\n\n💰 **รวม: ${$(t)}/เดือน**`, actions:[{ label:'📋 จัดการ', handler:'subs' }] }
    }

    if (l.includes('เปลือง') || l.includes('วิเคราะห์')) {
      const cats: Record<string,number> = {}
      s.transactions.filter(x=>x.type==='expense').forEach(x => { cats[x.category] = (cats[x.category]||0) + x.amount })
      const sorted = Object.entries(cats).sort((a,b) => b[1]-a[1])
      return { text:`📊 **วิเคราะห์:**\n${sorted.map(([c,a])=>`• **${c}** ${$(a)}`).join('\n')}\n\n💡 ถ้าลดกินนอกบ้าน 2 มื้อ/สัปดาห์ ประหยัด ~600/เดือน`, actions:[{ label:'📊 ดัชบอร์ด', handler:'dashboard' }] }
    }

    if (l.includes('สวัสดี') || l.includes('หวัดดี') || l.includes('hi')) {
      return { text:'สวัสดี! 👋\n\nฉัน **Finmate** 🤖 ช่วย:\n• บันทึกรายจ่าย: พิมพ์ "กินข้าว 60"\n• เช็ค Subscription: พิมพ์ "sub"\n• เตือนก่อนตัด: พิมพ์ "เงินจะหมด"\n• วิเคราะห์: พิมพ์ "ใช้เงินเปลือง"', actions:[{ label:'💰 "เงินจะหมด"', handler:'check' },{ label:'📋 "sub"', handler:'subs' }] }
    }

    return { text:'🙏 พิมพ์ "สวัสดี" เพื่อเริ่ม หรือ "กินข้าว 60" บันทึกรายจ่าย', actions:[{ label:'💬 สวัสดี', handler:'hello' }] }
  },
}))
