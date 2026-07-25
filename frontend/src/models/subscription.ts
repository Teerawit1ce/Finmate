export interface Subscription {
  id: string
  name: string
  serviceName: string
  category: string
  amount: number
  billingCycle: 'weekly' | 'monthly' | 'yearly'
  billingDate: number
  nextBilling: string
  isActive: boolean
  reminderDays: number
  logoUrl?: string
  notes?: string
  createdAt: string
}

export interface CreateSubscriptionBody {
  name: string
  serviceName: string
  category: string
  amount: number
  billingCycle: 'weekly' | 'monthly' | 'yearly'
  billingDate: number
  nextBilling: string
  userId: string
}

export interface Budget {
  id: string
  monthlyLimit: number
  dailyQuota: number
  month: number
  year: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: {
    detectedSubscription?: string
    suggestedAction?: string
    category?: string
    amount?: number
  }
  createdAt: string
}

export const SUBSCRIPTION_CATEGORIES = ['บันเทิง', 'ดนตรี', 'เครื่องมือ', 'การศึกษา', 'เกม', 'อาหาร', 'อื่นๆ']

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub1', name: 'Netflix Premium', serviceName: 'Netflix', category: 'บันเทิง', amount: 419, billingCycle: 'monthly', billingDate: 26, nextBilling: '2026-07-26', isActive: true, reminderDays: 1, notes: 'แชร์กับเพื่อน 4 คน', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'sub2', name: 'Spotify Student', serviceName: 'Spotify', category: 'ดนตรี', amount: 69, billingCycle: 'monthly', billingDate: 15, nextBilling: '2026-08-15', isActive: true, reminderDays: 1, notes: 'ส่วนลดนักศึกษา', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'sub3', name: 'ChatGPT Plus', serviceName: 'OpenAI', category: 'เครื่องมือ', amount: 720, billingCycle: 'monthly', billingDate: 10, nextBilling: '2026-08-10', isActive: true, reminderDays: 3, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'sub4', name: 'YouTube Premium', serviceName: 'YouTube', category: 'บันเทิง', amount: 159, billingCycle: 'monthly', billingDate: 5, nextBilling: '2026-08-05', isActive: true, reminderDays: 1, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'sub5', name: 'iCloud+ 200GB', serviceName: 'Apple', category: 'เครื่องมือ', amount: 99, billingCycle: 'monthly', billingDate: 20, nextBilling: '2026-08-20', isActive: true, reminderDays: 0, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'sub6', name: 'Wongnai Pro', serviceName: 'Wongnai', category: 'อาหาร', amount: 89, billingCycle: 'monthly', billingDate: 1, nextBilling: '2026-08-01', isActive: false, reminderDays: 1, notes: 'เคยใช้ตอนสั่งอาหาร', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'sub7', name: 'Canva Pro', serviceName: 'Canva', category: 'เครื่องมือ', amount: 259, billingCycle: 'monthly', billingDate: 18, nextBilling: '2026-08-18', isActive: true, reminderDays: 2, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'sub8', name: 'Disney+ Hotstar', serviceName: 'Disney', category: 'บันเทิง', amount: 199, billingCycle: 'monthly', billingDate: 12, nextBilling: '2026-08-12', isActive: false, reminderDays: 0, notes: 'เลิกดูแล้วแต่ลืมยกเลิก', createdAt: '2026-05-01T00:00:00Z' },
]
