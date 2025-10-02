import { Client, Account, Databases, Storage } from "appwrite"

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68de92920035332b5b7b")

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "68de937d00293894fef2"
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || "users",
  GROUPS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUPS || "groups",
  GROUP_MEMBERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_MEMBERS || "group_members",
  MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES || "messages",
}

export { client }
