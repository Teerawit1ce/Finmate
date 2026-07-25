export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description?: string
  transactionDate: string
  userId: string
  createdAt: string
}

export interface CreateTransactionBody {
  type: 'income' | 'expense'
  category: string
  amount: number
  description?: string
  transactionDate: string
  userId: string
}

export interface UpdateTransactionBody {
  type?: 'income' | 'expense'
  category?: string
  amount?: number
  description?: string
  transactionDate?: string
}

export interface TransactionListResponse { data: Transaction[] }
export interface TransactionResponse { data: Transaction }

export const INCOME_CATEGORIES = ['เงินเดือน', 'ฟรีแลนซ์', 'ลงทุน', 'ของขวัญ', 'อื่นๆ']
export const EXPENSE_CATEGORIES = ['อาหารและเครื่องดื่ม', 'เดินทาง', 'ช้อปปิ้ง', 'สาธารณูปโภค', 'บันเทิง', 'สุขภาพ', 'การศึกษา', 'ที่อยู่อาศัย', 'อื่นๆ']
