"use client"

import { account } from "./config"
import { ID } from "appwrite"

export async function clientLogin(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password)
    return { success: true, session }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function clientSignup(email: string, password: string, name: string) {
  try {
    const user = await account.create(ID.unique(), email, password, name)
    // Auto login after signup
    const session = await account.createEmailPasswordSession(email, password)
    return { success: true, user, session }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function clientLogout() {
  try {
    await account.deleteSession("current")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function clientGetCurrentUser() {
  try {
    const user = await account.get()
    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
