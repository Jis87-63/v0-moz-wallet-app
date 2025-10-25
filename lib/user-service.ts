import { database } from "./firebase"
import { ref, set, get, update } from "firebase/database"

export interface UserData {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  balance: number
  level: number
  totalInvested: number
  dailyRewardsCompleted: number
  lastRewardDate: string
  createdAt: string
  transactions: Transaction[]
}

export interface Transaction {
  id: string
  type: "deposit" | "reward" | "purchase" | "investment"
  amount: number
  description: string
  timestamp: string
}

export const createUserProfile = async (uid: string, email: string, displayName: string, photoURL?: string) => {
  try {
    console.log("[v0] Creating user profile for:", uid)
    const userRef = ref(database, `users/${uid}`)
    const snapshot = await get(userRef)

    if (!snapshot.exists()) {
      console.log("[v0] User doesn't exist, creating new profile...")
      const userData: UserData = {
        uid,
        email,
        displayName,
        photoURL,
        balance: 0,
        level: 1,
        totalInvested: 0,
        dailyRewardsCompleted: 0,
        lastRewardDate: "",
        createdAt: new Date().toISOString(),
        transactions: [],
      }

      await set(userRef, userData)
      console.log("[v0] User profile created successfully")
      return userData
    }

    console.log("[v0] User profile already exists")
    return snapshot.val() as UserData
  } catch (error) {
    console.error("[v0] Error creating user profile:", error)
    throw error
  }
}

export const getUserData = async (uid: string): Promise<UserData | null> => {
  const userRef = ref(database, `users/${uid}`)
  const snapshot = await get(userRef)

  if (snapshot.exists()) {
    return snapshot.val() as UserData
  }

  return null
}

export const updateUserBalance = async (uid: string, amount: number) => {
  const userRef = ref(database, `users/${uid}`)
  await update(userRef, { balance: amount })
}

export const addTransaction = async (uid: string, transaction: Transaction) => {
  const userRef = ref(database, `users/${uid}/transactions/${transaction.id}`)
  await set(userRef, transaction)
}

export const calculateRewardAmount = (level: number): number => {
  const baseReward = 50 // Base reward in MZN
  return baseReward * level
}

export const calculateLevelFromInvestment = (totalInvested: number): number => {
  if (totalInvested < 1000) return 1
  if (totalInvested < 5000) return 2
  if (totalInvested < 10000) return 3
  if (totalInvested < 25000) return 4
  if (totalInvested < 50000) return 5
  return 6
}
