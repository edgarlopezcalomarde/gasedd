import Dexie, { type Table } from "dexie"

export interface CacheEntry {
  id: string
  data: unknown
  timestamp: number
  expiresAt: number
  queryKey: string
}

export class GasEddDatabase extends Dexie {
  cache!: Table<CacheEntry>

  constructor() {
    super("GasEddCache")
    this.version(1).stores({
      cache: "id, expiresAt, queryKey",
    })
  }
}

export const db = new GasEddDatabase()
