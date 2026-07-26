import { useState, useRef, useEffect } from 'react'
import { useStore } from './store'
import type { Sub, Tx, Msg } from './store'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Send, Sparkles, Repeat2, LayoutDashboard, MessageSquare, Bell, BellOff, X, Menu } from 'lucide-react'

const $ = (n: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(n)
const TODAY = new Date().toISOString().slice(0, 10)

function render(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
}

// ════ Dashboard ════
function Dashboard() {
  const balance = useStore((s) => s.balance)
  const tx = useStore((s) => s.transactions)
  const subs = useStore((s) => s.subscriptions)
  const income = tx.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const expense = tx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const netflix = subs.find((s) => s.id === 's1')
  const recent = tx.slice(0, 4)
  const cats: Record<string, number> = {}
  tx.filter((t) => t.type === 'expense').forEach((t) => { cats[t.category] = (cats[t.category] || 0) + t.amount })
  const catSorted = Object.entries(cats).sort((a, b) => b[1] - a[1])
  const catTotal = Object.values(cats).reduce((a, v) => a + v, 0)
  const COLORS = ['#1431ff', '#059669', '#d97706', '#dc2626', '#8b5cf6']

  return (
    <div className="p-4 pb-24 space-y-4">
      <div><h1 className="text-xl font-bold">สวัสดี 👋</h1><p className="text-xs text-gray-500">สรุปการเงินวันนี้</p></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-1"><Wallet size={16} /><span className="text-sm opacity-80">ยอดคงเหลือ</span></div>
        <div className="text-4xl font-bold mb-3">{$(balance)}</div>
        <div className="flex gap-5"><span className="flex items-center gap-1 text-sm"><TrendingUp size={14} className="text-green-300" />{$(income)}</span><span className="flex items-center gap-1 text-sm"><TrendingDown size={14} className="text-red-300" />{$(expense)}</span></div>
      </motion.div>

      {netflix?.active && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-orange-400 shrink-0 mt-0.5" />
          <div><div className="font-medium text-orange-400">⚠️ พรุ่งนี้มีตัดค่าใช้จ่าย!</div><div className="text-sm text-gray-400 mt-0.5"><strong className="text-white">Netflix Premium</strong> {$(419)} กำลังจะตัด</div></div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-sm text-gray-400 mb-3">📊 สัดส่วนค่าใช้จ่าย</h3>
        <div className="flex gap-2 mb-3">{catSorted.map(([cat, amt], i) => { const p = catTotal > 0 ? Math.round((amt / catTotal) * 100) : 0; return <div key={cat} className="h-2 rounded-full transition-all" style={{ width: p + '%', backgroundColor: COLORS[i % COLORS.length] }} /> })}</div>
        {catSorted.map(([cat, amt], i) => (<div key={cat} className="flex items-center justify-between text-sm py-1"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span>{cat}</span></div><div className="flex items-center gap-3"><span className="text-gray-500">{catTotal > 0 ? Math.round((amt / catTotal) * 100) : 0}%</span><span className="font-medium">{$(amt)}</span></div></div>))}
      </motion.div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-sm text-gray-400 mb-3">💳 รายการล่าสุด</h3>
        {recent.map((t) => (<div key={t.id} className="flex items-center justify-between py-1.5"><div className="flex items-center gap-2.5"><div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`} /><div><div className="text-sm">{t.description}</div><div className="text-[10px] text-gray-500">{t.date}</div></div></div><span className={`text-sm font-medium ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{t.type === 'income' ? '+' : '-'}{$(t.amount)}</span></div>))}
      </div>
    </div>
  )
}

// ════ Chat ════
function Chat() {
  const { messages, addMsg, processChat, setTab } = useStore()
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  function send(text: string) {
    if (!text.trim()) return
    setInput('')
    addMsg({ id: 'u_' + Date.now(), role: 'user', text: text.trim(), timestamp: Date.now() } as Msg)
    setTyping(true)
    setTimeout(() => {
      const r = processChat(text.trim())
      if (r.text) addMsg({ id: 'a_' + Date.now(), role: 'assistant', text: r.text, actions: r.actions, timestamp: Date.now() } as Msg)
      setTyping(false)
    }, 700)
  }

  function handle(handler: string) {
    const map: Record<string, string> = { 'cancel-netflix': '', 'check': 'เงินจะหมดแล้ว', 'subs': 'sub', 'dashboard': '', 'hello': 'สวัสดี' }
    if (handler === 'cancel-netflix') { useStore.getState().cancelSub('s1'); return }
    if (handler === 'dashboard') { setTab('dashboard'); return }
    if (handler === 'subs') { setTab('subscriptions'); return }
    if (map[handler]) send(map[handler])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800"><h2 className="font-semibold flex items-center gap-2"><Sparkles size={18} className="text-primary" />หารเท่า.ai</h2><p className="text-xs text-gray-500">AI Agent ผู้ช่วยบริหารเงิน</p></div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%]">
                {msg.role === 'assistant' && <div className="flex items-center gap-2 mb-1.5"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold">H</div><span className="text-xs text-gray-500">หารเท่า.ai</span></div>}
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-md' : 'bg-gray-800/80 border border-gray-700/50 rounded-tl-md'}`}>
                  <div dangerouslySetInnerHTML={{ __html: render(msg.text) }} />
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.actions.map((a, i) => (
                        <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handle(a.handler)}
                          className="px-3 py-1.5 text-xs font-medium rounded-full border border-primary/50 text-primary bg-primary/5 hover:bg-primary/15"
                        >{a.label}</motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl rounded-tl-md px-4 py-3"><div className="flex gap-1.5">{[0,1,2].map((i) => <motion.div key={i} animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 1.2, delay: i*0.2 }} className="w-2 h-2 rounded-full bg-primary/60" />)}</div></div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-800/50">
        {['🍜 กินข้าว 60', '💰 เงินจะหมดแล้ว', '📋 sub', '📊 ใช้เงินเปลือง'].map((chip) => (
          <button key={chip} onClick={() => send(chip.replace(/^[^\s]+\s/, ''))}
            className="px-3 py-1.5 text-xs rounded-full bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:bg-gray-700/60 whitespace-nowrap"
          >{chip}</button>
        ))}
      </div>

      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2 bg-gray-800/80 rounded-xl px-4 py-2 border border-gray-700/50">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="พิมพ์รายจ่ายของคุณ..." className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => send(input)} disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center disabled:opacity-30"><Send size={16} /></motion.button>
        </div>
      </div>
    </div>
  )
}

// ════ Subscriptions ════
function Subs() {
  const { subscriptions, toggleSub } = useStore()
  const active = subscriptions.filter((s) => s.active)
  const total = active.reduce((a, s) => a + s.amount, 0)
  const colors = ['#1431ff', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#ec4899']

  return (
    <div className="p-4 pb-24">
      <h2 className="text-lg font-semibold mb-1">📋 Subscription</h2>
      <p className="text-xs text-gray-500 mb-4">จัดการแอปที่สมัครไว้</p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'กำลังใช้', value: `${active.length} รายการ`, color: 'text-primary' },
          { label: 'รวม/เดือน', value: $(total), color: 'text-green-400' },
          { label: 'รวม/ปี', value: $(total * 12), color: 'text-yellow-400' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-800/30 rounded-xl p-3 text-center border border-gray-700/30">
            <div className="text-[10px] text-gray-500">{item.label}</div>
            <div className={`text-sm font-semibold mt-1 ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {subscriptions.map((sub, i) => {
        const due = Math.ceil((new Date(sub.nextBilling).getTime() - Date.now()) / 86400000)
        const urgent = sub.active && due <= 3
        return (
          <motion.div key={sub.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-xl p-4 border mb-2.5 transition-all ${sub.active ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-800/20 border-gray-700/20 opacity-60'} ${urgent ? 'border-orange-500/30 ring-1 ring-orange-500/20' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: sub.active ? colors[i % colors.length] : '#374151' }}>{sub.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="font-medium text-sm truncate">{sub.name}</span>{urgent && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium">{due} วัน</span>}</div>
                <div className="text-xs text-gray-500 mt-0.5">ตัดวันที่ {sub.billingDay}</div>
              </div>
              <div className="text-right"><div className="font-semibold">{$(sub.amount)}</div><div className="text-[10px] text-gray-500">/เดือน</div></div>
              <button onClick={() => toggleSub(sub.id)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${sub.active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                {sub.active ? <BellOff size={16} /> : <Bell size={16} />}
              </button>
            </div>
            {sub.note && sub.active && <div className="text-xs text-gray-500 mt-2 ml-[52px]">{sub.note}</div>}
          </motion.div>
        )
      })}
    </div>
  )
}

// ════ Layout ════
const TABS = [
  { id: 'dashboard', label: 'ดัชบอร์ด', icon: LayoutDashboard },
  { id: 'chat', label: 'แชท', icon: MessageSquare },
  { id: 'subscriptions', label: 'Subscription', icon: Repeat2 },
]

export default function App() {
  const { tab, setTab } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900/50 border-r border-gray-800 p-4">
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">H</div>
          <div><div className="font-semibold text-sm">หารเท่า.ai</div><div className="text-[10px] text-gray-500">HarnTao Finance</div></div>
        </div>
        <nav className="space-y-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${tab === t.id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>
              <t.icon size={18} />{t.label}
              {tab === t.id && <motion.div layoutId="at" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </nav>
        <div className="mt-auto text-[10px] text-gray-600 px-2">v1.0 · Hackathon Demo</div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">H</div><span className="font-semibold text-sm">หารเท่า.ai</span></div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </header>

        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-2">
            <div className="flex gap-2">{TABS.map((t) => (<button key={t.id} onClick={() => { setTab(t.id); setMobileOpen(false) }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${tab === t.id ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'}`}>
              <div className="flex flex-col items-center gap-1"><t.icon size={16} />{t.label}</div></button>))}</div>
          </motion.div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'chat' && <Chat />}
          {tab === 'subscriptions' && <Subs />}
        </div>

        <nav className="md:hidden flex bg-gray-900/95 border-t border-gray-800 backdrop-blur-lg pb-2">
          {TABS.map((t) => (<button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-all ${tab === t.id ? 'text-primary' : 'text-gray-500'}`}>
            <t.icon size={20} /><span className="text-[10px]">{t.label}</span></button>))}
        </nav>
      </div>
    </div>
  )
}
