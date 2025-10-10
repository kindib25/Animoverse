"use client"

import { account } from "./config"
import { ID } from "appwrite"
import { clientCreateUserProfile } from "./client-database"

export async function clientLogin(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password)
    return { success: true, session }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function clientSignup(
  email: string,
  password: string,
  name: string,
  userType: "student" | "teacher" | "admin" = "student",
) {
  try {
    const user = await account.create(ID.unique(), email, password, name)

    // Create profile in database with userType
    const username = email.split("@")[0] // Generate username from email
    await clientCreateUserProfile(user.$id, {
      name,
      username,
      email,
      accountId: user.$id,
      userType, // Include userType in profile creation
    })

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

export async function clientUpdatePassword(oldPassword: string, newPassword: string) {
  try {
    await account.updatePassword(newPassword, oldPassword)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


export const getCurrentUser = clientGetCurrentUser