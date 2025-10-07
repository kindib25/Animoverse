import { Client, Account, Databases, Storage, Avatars } from "appwrite";

// Load from environment variables
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "");

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

// Database and Collection IDs from .env.local
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "";
export const COLLECTIONS = {
  GROUP_MEMBERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_MEMBERS ?? "",
  GROUPS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUPS ?? "",
  USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS ?? "",
  MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES ?? "",
  // Add more collections as needed
};

export { client }