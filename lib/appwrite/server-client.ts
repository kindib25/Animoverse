import { Client } from "appwrite"

let serverClient: Client | null = null

export function getServerClient() {
  if (!serverClient) {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://nyc.cloud.appwrite.io/v1"
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? ""
    const apiKey = process.env.APPWRITE_API_KEY ?? ""

    if (!projectId || !apiKey) {
      throw new Error("Appwrite server credentials are missing. Please set APPWRITE_API_KEY and project ID environment variables.")
    }

    serverClient = (new Client() as any)
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey) as Client
      
  }

  return serverClient
}