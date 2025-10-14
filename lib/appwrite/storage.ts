"use client"

import { storage, STORAGE_ID } from "./config"
import { ID } from "appwrite"

export async function uploadGroupImage(file: File) {
  try {
    const response = await storage.createFile(STORAGE_ID, ID.unique(), file)

    // Get the file URL
    const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

    return {
      success: true,
      fileId: response.$id,
      fileUrl,
    }
  } catch (error: any) {
    console.error("[v0] Error uploading image:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function deleteGroupImage(fileId: string) {
  try {
    await storage.deleteFile(STORAGE_ID, fileId)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error deleting image:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function uploadProfileImage(file: File) {
  try {
    const response = await storage.createFile(STORAGE_ID, ID.unique(), file)

    // Get the file URL
    const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

    return {
      success: true,
      fileId: response.$id,
      fileUrl,
    }
  } catch (error: any) {
    console.error("[v0] Error uploading profile image:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export function getImageUrl(fileId: string) {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
}
