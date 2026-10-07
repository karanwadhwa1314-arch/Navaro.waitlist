import { MongoClient, type Collection } from 'mongodb'

/**
 * Server-only MongoDB client for the Navaro CRM cluster. MONGODB_URI must
 * include the CRM's database name (same value the CRM uses). The client is
 * cached on globalThis so serverless warm invocations reuse one connection.
 * NEVER import into a 'use client' component — MONGODB_URI is a secret.
 */
declare global {
  // eslint-disable-next-line no-var
  var __navaroCrmMongo: Promise<MongoClient> | undefined
}

function getClient(): Promise<MongoClient> {
  if (globalThis.__navaroCrmMongo) return globalThis.__navaroCrmMongo
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Missing MONGODB_URI — cannot connect to the CRM database')
  }
  const promise = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 }).connect()
  // Do not cache a failed connection — let the next call retry.
  promise.catch(() => {
    globalThis.__navaroCrmMongo = undefined
  })
  globalThis.__navaroCrmMongo = promise
  return promise
}

/** The CRM's `leads` collection (Mongoose model "Lead"). */
export async function getCrmLeads(): Promise<Collection> {
  const client = await getClient()
  return client.db().collection('leads')
}
