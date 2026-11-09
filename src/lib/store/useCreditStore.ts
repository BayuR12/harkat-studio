import { create } from 'zustand'

interface CreditState {
  balance: number
  addCredits: (amount: number) => void
  useCredits: (amount: number) => boolean
  setBalance: (amount: number) => void
}

export const useCreditStore = create<CreditState>((set) => ({
  balance: 50, // Default mock balance for free user
  addCredits: (amount) => set((state) => ({ balance: state.balance + amount })),
  useCredits: (amount) => {
    let success = false
    set((state) => {
      if (state.balance >= amount) {
        success = true
        return { balance: state.balance - amount }
      }
      return state
    })
    return success
  },
  setBalance: (amount) => set({ balance: amount }),
}))
