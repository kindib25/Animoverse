"use server"

import { account } from "./config"
import { ID } from "appwrite"

export async function createAccount(email: string, password: string, name: string) {
  try {
    const user = await account.create(ID.unique(), email, password, name)
    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function login(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password)
    return { success: true, session }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function logout() {
  try {
    await account.deleteSession("current")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCurrentUser() {
  try {
    const user = await account.get()
    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getSession() {
  try {
    const session = await account.getSession("current")
    return { success: true, session }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
